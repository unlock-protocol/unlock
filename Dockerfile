# syntax = docker/dockerfile:experimental

# default LISTEN port to 3000
ARG PORT=3000

##
## 1. get only needed packages
##
FROM alpine:3.16 as manifests

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
FROM node:16-alpine as dev
LABEL Unlock <ops@unlock-protocol.com>

# args need to be mentioned at each stage
ARG BUILD_DIR
ARG PORT

# setup home dir
RUN mkdir -p /home/unlock
RUN chown -R node /home/unlock
WORKDIR /home/unlock

# copy packages info
COPY --chown=node --from=manifests /opt/manifests .
COPY --chown=node .prettierrc /home/unlock/.

# yarn config
COPY --chown=node .yarn/ /home/unlock/.yarn/
COPY --chown=node .yarnrc.yml /home/unlock/.yarnrc.yml

# add yarn cache folder to be used by docker buildkit
RUN echo "cacheFolder: /home/unlock/yarn-cache" >> .yarnrc.yml

# Setting user as root to handle apk install
USER root

# apk steps merged to leverage virtual install of package
# allowing for removal after yarn dependencies install
RUN apk add --no-cache --virtual .build-deps \
    bash \
    git \
    openssh \
    python3 \
    python3-dev \
    py3-pip \
    build-base \
    openjdk11 \
    && pip3 install --no-cache-dir virtualenv

# install deps
USER node

# attempt to create dir only for non-packages
RUN if echo ${BUILD_DIR} | grep -q "packages" ; then echo "skipping"; else mkdir /home/unlock/${BUILD_DIR}; fi

COPY --chown=node ${BUILD_DIR}/package.json /home/unlock/${BUILD_DIR}/package.json
RUN --mount=type=cache,target=/home/unlock/yarn-cache,uid=1000,gid=1000 yarn install

# delete deps once packages are built
USER root
RUN apk del .build-deps \
    && apk add bash openjdk11

RUN java -version
RUN javac -version

# make sure of cache folder perms
RUN chown -R node:node /home/unlock/yarn-cache

USER node

# build all packages in packages/**
RUN yarn build

# copy scripts
RUN mkdir /home/unlock/scripts
COPY --chown=node scripts /home/unlock/scripts

# copy app code
COPY --chown=node ${BUILD_DIR}/ /home/unlock/${BUILD_DIR}/.

###
## Need to run subgraph test 
###
FROM dev as subgraph 

USER root
RUN apk add postgresql \ 
    build-base \ 
    libpq-dev 

ENV GLIBC_REPO=https://github.com/sgerrand/alpine-pkg-glibc
ENV GLIBC_VERSION=2.30-r0
RUN set -ex && \
    apk --update add libstdc++ curl ca-certificates && \
    for pkg in glibc-${GLIBC_VERSION} glibc-bin-${GLIBC_VERSION}; \
        do curl -sSL ${GLIBC_REPO}/releases/download/${GLIBC_VERSION}/${pkg}.apk -o /tmp/${pkg}.apk; done && \
    apk add --force-overwrite --allow-untrusted /tmp/*.apk && \
    rm -v /tmp/*.apk && \
    /usr/glibc-compat/sbin/ldconfig /lib /usr/glibc-compat/lib

##
## 3. build the app
##
FROM dev as build

ARG BUILD_DIR
ARG PORT

# additional build step (nb: strip "packages/" to get worspace name)
RUN yarn workspace @unlock-protocol/${BUILD_DIR/packages\/} build

# package everything for prod
RUN cd $BUILD_DIR && yarn prod-install --pack /home/node/app

##
## 4. export a minimal image w only the prod app
##
FROM node:16-alpine as prod

ARG BUILD_DIR
ARG PORT
ARG COMMAND="yarn prod"
ENV COMMAND=${COMMAND}

USER root
RUN mkdir /app
RUN chown node:node /app

WORKDIR /app

# copy package info
COPY --from=build --chown=node /home/node/app .

# start command
EXPOSE $PORT

CMD $COMMAND