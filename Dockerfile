# syntax = docker/dockerfile:experimental

# default LISTEN port to 3000
ARG PORT=3000

FROM node:16-alpine as dev
LABEL Unlock <ops@unlock-protocol.com>

# args need to be mentioned at each stage
ARG BUILD_DIR
ARG PORT

# setup home dir
RUN mkdir -p /home/unlock
RUN chown -R node /home/unlock
WORKDIR /home/unlock

# add yarn cache folder to be used by docker buildkit locally
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

# copy all code
COPY --chown=node . /home/unlock/

# attempt to create dir only for non-packages
RUN --mount=type=cache,target=/home/unlock/yarn-cache,uid=1000,gid=1000 yarn install

# make sure jav is installed properly
RUN java -version
RUN javac -version

# make sure of cache folder perms
RUN chown -R node:node /home/unlock/yarn-cache

# build all packages in packages/**
RUN yarn build

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
    apk add --allow-untrusted /tmp/*.apk && \
    rm -v /tmp/*.apk && \
    /usr/glibc-compat/sbin/ldconfig /lib /usr/glibc-compat/lib

##
## export a minimal image w only the prod app
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