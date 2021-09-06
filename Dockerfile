# default value
ARG BUILD_DIR=unlock-js

##
## 1. get only needed packages
##
FROM alpine:3.11 as manifests

# args need to be mentioned at each stage
ARG BUILD_DIR

# install deps
RUN apk add coreutils jq

# copy 
WORKDIR /tmp
COPY package.json .
COPY yarn.lock .

# only needed workspaces in manifest
RUN  mkdir /opt/manifests /opt/manifests/packages
RUN jq  -r '.workspaces |= ["packages/**", "'${BUILD_DIR}'"]' /tmp/package.json > /opt/manifests/package.json \
    && cp yarn.lock /opt/manifests

# add shared folder
WORKDIR /opt/manifests
COPY packages  /opt/manifests/packages

##
## 2. build the app
##
FROM node:12-alpine as unlock-app
LABEL Unlock <ops@unlock-protocol.com>

# args need to be mentioned at each stage
ARG BUILD_DIR

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

# copy app code
RUN mkdir /home/unlock/${BUILD_DIR}
COPY --chown=node ${BUILD_DIR}/ /home/unlock/${BUILD_DIR}/.

# copy scripts
RUN mkdir /home/unlock/scripts
COPY --chown=node scripts /home/unlock/scripts

# install deps
RUN SKIP_SERVICES=true yarn install --pure-lockfile --non-interactive

# delete deps once packages are built
USER root
RUN apk del .build-deps \
    && apk add bash

USER node