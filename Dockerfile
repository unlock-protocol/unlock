# syntax = docker/dockerfile:experimental

ARG NODE_VERSION=22.13.0-bullseye
# the graph cli binary does not work with bookworm which is the default for Node 20 images. Once the graph-cli binary has been updated to not use https://www.npmjs.com/package/binary-install-raw we can use bookworm.

###################################################################
# Stage 1: Install all workspaces (dev)dependencies               #
#          and generates node_modules folder(s)                   #
###################################################################
FROM node:$NODE_VERSION as deps
LABEL Unlock <ops@unlock-protocol.com>

# Setting user as root to handle apt install
USER root

# install all deps required to build modules
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive \
    apt-get install --no-install-recommends --assume-yes \
    bash \
    git \
    rsync \
    python3 \
    postgresql \
    default-jdk \
    openjdk-17-jre \
    build-essential \
    ca-certificates

# Setup 1password cli
RUN ARCH="amd64"; \
    OP_VERSION="v$(curl https://app-updates.agilebits.com/check/1/0/CLI2/en/2.0.0/N -s | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+')"; \
    curl -sSfo op.zip \
    https://cache.agilebits.com/dist/1P/op2/pkg/"$OP_VERSION"/op_linux_"$ARCH"_"$OP_VERSION".zip \
    && unzip -od /usr/local/bin/ op.zip \
    && rm op.zip

# setup folder
ENV DEST_FOLDER=/home/unlock
RUN mkdir $DEST_FOLDER
WORKDIR ${DEST_FOLDER}

# We use rsync to prepare all package.json files that are necessary 
# for packages install and used to invalidate buidkit docker cache
RUN --mount=type=bind,target=/docker-context \
    rsync -amv --delete \
    --exclude='node_modules' \
    --exclude='*/node_modules' \
    --include='package.json' \
    --include='*/' --exclude='*' \
    /docker-context/ $DEST_FOLDER;

# yarn related files
COPY yarn.lock .
COPY .yarnrc.yml .
COPY .yarn/plugins .yarn/plugins
COPY .yarn/releases .yarn/releases
COPY .yarn/patches .yarn/patches

# use custom .yarn/cache folder (for local dev)
RUN echo "cacheFolder: ${DEST_FOLDER}/yarn-cache" >> .yarnrc.yml
RUN mkdir ./yarn-cache
RUN chown -R node:node .

# install deps
USER node
RUN --mount=type=cache,target=${DEST_FOLDER}/yarn-cache,uid=1000,gid=1000 yarn

# Dedupe deps
# RUN yarn dedupe # disabled as it may cause issues

###################################################################
# Stage 2: Build packages and app
###################################################################
FROM deps as dev

ENV DEST_FOLDER=/home/unlock

# enforce perms
USER node
COPY --chown=node . .

# make sure java is installed properly
RUN java -version
RUN javac -version

# Run yarn to install missing dependencies from cached image
RUN --mount=type=cache,target=${DEST_FOLDER}/yarn-cache,uid=1000,gid=1000 yarn

# build all packages in packages/**
RUN yarn build

# Cleanup up image to make it lighter
USER root
RUN apt-get autoremove
USER node

# Remove yarn cache (re-installing dependencies will take more time, but image will be 500MB lighter)
RUN rm -rf .yarn/cache/ 

###################################################################
# Stage 3. export minimal image for prod app
###################################################################
FROM dev as prod

# default values
ARG COMMAND="echo 'no command specified'"
ENV BUILD_DIR='locksmith'
ENV COMMAND=${COMMAND}

WORKDIR /home/unlock/${BUILD_DIR}

# start command
EXPOSE 3000

CMD $COMMAND