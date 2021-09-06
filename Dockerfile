# default value
ARG BUILD_DIR=unlock-js

#
# 1. fetch packages
#
FROM alpine:3.11 as manifests

# args need to be mentioned at each stage
ARG BUILD_DIR

# install deps
RUN apk add coreutils jq

# copy 
WORKDIR /tmp
COPY package.json .
COPY yarn.lock .

# remove unused workspaces from manifest
RUN  mkdir /opt/manifests /opt/manifests/packages  \
    && jq  -r '.workspaces |= ["packages/**", ["${BUILD_DIR}}"]' /tmp/package.json | \
    xargs -n 1 -I'{}' sh -c 'mkdir /opt/manifests/{}; cp {}/package.json /opt/manifests/{}' \
    && cp yarn.lock /opt/manifests \
    && cp package.json /opt/manifests

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
# RUN mkdir /home/unlock/scripts
RUN chown -R node /home/unlock
WORKDIR /home/unlock

# To leverage the docker caching it is better to install the deps
# before the file changes. This will allow docker to not install
# dependencies again if they are not changed.

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

# install deps
RUN SKIP_SERVICES=true yarn install --pure-lockfile --non-interactive

# delete deps once packages are built
USER root
RUN apk del .build-deps \
    && apk add bash

USER node
WORKDIR /home/unlock/${BUILD_DIR}