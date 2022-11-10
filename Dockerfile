# syntax = docker/dockerfile:experimental

# default LISTEN port to 3000
ARG PORT=3000

FROM node:16-slim as dev
LABEL Unlock <ops@unlock-protocol.com>

# args need to be mentioned at each stage
ARG BUILD_DIR
ARG PORT

# setup home dir
RUN mkdir -p /home/unlock
RUN chown -R node /home/unlock
WORKDIR /home/unlock

# Setting user as root to handle apk install
USER root

# apk steps merged to leverage virtual install of package
# allowing for removal after yarn dependencies install
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive \
    apt-get install --no-install-recommends --assume-yes \
    bash \
    git \
    python3 \
    build-essential \
    postgresql \
    default-jdk \
    openjdk-11-jre

# install deps
USER node

# copy all code
COPY --chown=node . /home/unlock/

# attempt to create dir only for non-packages
RUN yarn install

# make sure jav is installed properly
RUN java -version
RUN javac -version

# build all packages in packages/**
RUN yarn build


##
## export a minimal image w only the prod app
##
FROM node:16-slim as prod

ARG BUILD_DIR
ARG PORT
ARG COMMAND
ENV COMMAND=${COMMAND}

USER root
RUN mkdir /app
RUN chown node:node /app

WORKDIR /app

# copy package info
COPY --from=build --chown=node /home/node/app .

# start command
EXPOSE $PORT

CMD yarn workspace @unlock-protocol/${BUILD_DIR} prod