# syntax = docker/dockerfile:experimental

ARG NODE_VERSION=16

###################################################################
# Stage 1: Install all workspaces (dev)dependencies               #
#          and generates node_modules folder(s)                   #
###################################################################
FROM node:${NODE_VERSION}-bullseye as deps
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
    openjdk-11-jre \
    build-essential \
    ca-certificates

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

# use custom .yarn/cache folder (for local dev)
RUN echo "cacheFolder: ${DEST_FOLDER}/yarn-cache" >> .yarnrc.yml
RUN mkdir ./yarn-cache
RUN chown -R node:node .

# install deps
USER node
RUN --mount=type=cache,target=${DEST_FOLDER}/yarn-cache,uid=1000,gid=1000 yarn

# Dedupe deps
RUN yarn dedupe

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

# Build locksmith and other apps separately to reduce startup time on heroku
RUN yarn apps:build

# Cleanup up image to make it lighter
RUN sudo apt-get autoremove

# Remove yarn cache (re-installing dependencies will take more time, but image will be 500MB lighter)
RUN rm -rf .yarn/cache/ 

###################################################################
# Stage 3. export minimal image for prod app
###################################################################
FROM dev as prod

# default values
ARG COMMAND="yarn prod"
ENV BUILD_DIR='locksmith'
ENV COMMAND=${COMMAND}

WORKDIR /home/unlock/${BUILD_DIR}

# start command
EXPOSE 3000

CMD $COMMAND