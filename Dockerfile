# syntax = docker/dockerfile:experimental

# default LISTEN port to 3000
ARG PORT=3000

#
# 1. install only deps (to be cached)
#
FROM node:16-bullseye-slim as deps
LABEL Unlock <ops@unlock-protocol.com>

# args need to be mentioned at each stage
ARG BUILD_DIR
ARG PORT

# Setting user as root to handle apt install
USER root

# install all deps required to build modules
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive \
    apt-get install --no-install-recommends --assume-yes \
    bash \
    git \
    python3 \
    build-essential

# switch to user
ENV DEST_FOLDER=/opt/manifests

RUN mkdir $DEST_FOLDER

# copy files 
COPY . .

# copy all package.json files
RUN find . -maxdepth 3 -mindepth 2 -type f -name "package.json" ! -path '**node_modules**' ! -path './docker' -exec cp --parents '{}' $DEST_FOLDER \;
COPY package.json $DEST_FOLDER
COPY yarn.lock $DEST_FOLDER

# copy al yarn related files
COPY .yarnrc.yml $DEST_FOLDER
COPY .prettierrc $DEST_FOLDER
COPY .yarn/plugins $DEST_FOLDER/.yarn/plugins
COPY .yarn/releases $DEST_FOLDER/.yarn/releases
RUN chown -R node:node $DEST_FOLDER

# specify yarn cache folder location (to be used by docker buildkit)
RUN echo "cacheFolder: ${DEST_FOLDER}/yarn-cache" >> $DEST_FOLDER/.yarnrc.yml
RUN mkdir $DEST_FOLDER/yarn-cache
RUN chown -R node:node $DEST_FOLDER/yarn-cache

# install deps
WORKDIR ${DEST_FOLDER}
RUN yarn

#
# 2. build packages and prepare image for testing/dev
#
FROM node:16-bullseye-slim as dev

# install all deps required to build packages
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive \
    apt-get install --no-install-recommends --assume-yes \
    postgresql \
    default-jdk \
    openjdk-11-jre

# args need to be mentioned at each stage
ARG BUILD_DIR
ARG PORT

# copy files from deps layer
USER node
WORKDIR /home/unlock
COPY --from=deps --chown=node /opt/manifests .

# copy all files
COPY --chown=node . .

# make sure java is installed properly
RUN java -version
RUN javac -version

# build all packages in packages/**
RUN yarn build

##
## 3. export image for prod app
##
FROM dev as prod

ARG BUILD_DIR
ARG PORT
ARG COMMAND='yarn prod'
ENV COMMAND=${COMMAND}

WORKDIR /home/unlock/${BUILD_DIR}

# start command
EXPOSE $PORT

CMD $COMMAND