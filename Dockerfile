# syntax = docker/dockerfile:experimental

# default LISTEN port to 3000
ARG PORT=3000

##
## 1. get only needed packages
##
FROM alpine:3.11 as manifests

# args need to be mentioned at each stage
ARG BUILD_DIR
ARG PORT

# install deps
RUN apk add coreutils jq

# copy 
WORKDIR /tmp
COPY package.json .
COPY yarn.lock .

# only needed workspaces in manifest
RUN  mkdir /opt/manifests /opt/manifests/packages

# scope workspaces and prevent package hoisting
RUN jq  -r '.workspaces |= ["packages/**", "'${BUILD_DIR}'"]' /tmp/package.json > /opt/manifests/package.json \
    && cp yarn.lock /opt/manifests

# add shared folder
WORKDIR /opt/manifests
COPY packages  /opt/manifests/packages

##
## 2. fetch all deps
##
FROM node:12-alpine as dev
LABEL Unlock <ops@unlock-protocol.com>

# args need to be mentioned at each stage
ARG BUILD_DIR
ARG PORT

# add yarn cache to speedup local builds
ENV YARN_CACHE_FOLDER /home/unlock/yarn-cache

RUN mkdir /home/unlock
RUN chown -R node /home/unlock
WORKDIR /home/unlock

# copy packages info
COPY --chown=node --from=manifests /opt/manifests .
COPY --chown=node .prettierrc /home/unlock/.

# Setting user as root to handle apk install
USER root

# apk steps merged to leverage virtual install of package
# allowing for removal after yarn dependencies install
RUN apk add --no-cache --virtual .build-deps \
    bash \
    git \
    openssh \
    python \
    python-dev \
    py-pip \
    build-base \
    && pip install --no-cache-dir virtualenv

USER node
WORKDIR /home/unlock/

# install deps
RUN mkdir /home/unlock/${BUILD_DIR}
COPY --chown=node ${BUILD_DIR}/package.json /home/unlock/${BUILD_DIR}/package.json
COPY --chown=node ${BUILD_DIR}/yarn.lock /home/unlock/${BUILD_DIR}/yarn.lock
RUN --mount=type=cache,target=/home/unlock/yarn-cache,uid=1000,gid=1000 SKIP_SERVICES=true yarn install

# delete deps once packages are built
USER root
RUN apk del .build-deps \
    && apk add bash

# make sure of cache folder perms
RUN chown -R node:node /home/unlock/yarn-cache

USER node

# copy scripts
RUN mkdir /home/unlock/scripts
COPY --chown=node scripts /home/unlock/scripts

# copy app code
COPY --chown=node ${BUILD_DIR}/ /home/unlock/${BUILD_DIR}/.

##
## 3. build the app
##
FROM dev as build

ARG BUILD_DIR
ARG PORT

# additional build step
RUN yarn workspace @unlock-protocol/$BUILD_DIR build

##
## 4. export a minimal image w only the prod app
##
FROM node:12-alpine as prod

ARG BUILD_DIR
ARG PORT

USER root
RUN mkdir /app
RUN chown node:node /app

WORKDIR /app

# copy package info
COPY --from=build --chown=node /home/unlock/$BUILD_DIR/package.json package.json
COPY --from=build --chown=node /home/unlock/$BUILD_DIR/yarn.lock yarn.lock

# delete dev deps to prevent yarn from fetching them
RUN apk add --no-cache --virtual .build-deps coreutils jq  \
    && jq 'del(.devDependencies)' package.json > package.json.tmp \
    && mv package.json.tmp package.json \ 
    && apk del .build-deps \
    && chown node:node package.json

# prod install 
# NOTE: this required that all shared packages have been published to npm
USER node
ENV NODE_ENV production
RUN yarn install --production --non-interactive --pure-lockfile

# copy built files
COPY --from=build --chown=node /home/unlock/$BUILD_DIR/build/ .

# start command
EXPOSE $PORT
CMD ["yarn", "prod"]