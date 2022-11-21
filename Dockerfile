# syntax = docker/dockerfile:experimental

#
# 1. install only deps (to be cached)
#
FROM node:16-bullseye-slim as deps
LABEL Unlock <ops@unlock-protocol.com>

# Setting user as root to handle apt install
USER root

# install all deps required to build modules
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive \
    apt-get install --no-install-recommends --assume-yes \
    bash \
    git \
    python3 \
    postgresql \
    default-jdk \
    openjdk-11-jre \
    build-essential

# switch to user
ENV DEST_FOLDER=/home/unlock

RUN mkdir $DEST_FOLDER

# copy files 
WORKDIR /tmp
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
FROM deps as dev

# enforce perms
USER root
WORKDIR /home/unlock
RUN chown -R node:node /home/unlock

# default user
USER node
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

# default values
ENV BUILD_DIR='locksmith'
ENV COMMAND='yarn prod'

WORKDIR /home/unlock/${BUILD_DIR}

# start command
EXPOSE 3000

CMD $COMMAND