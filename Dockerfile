FROM alpine:3.11 as manifests
RUN apk add coreutils jq

WORKDIR /tmp

COPY . .

# copy over all packages files
RUN  mkdir /opt/manifests /opt/manifests/shared  \
    && jq  -r '.workspaces[]' /tmp/package.json | \
        xargs -n 1 -I'{}' sh -c 'mkdir /opt/manifests/{}; cp {}/package.json /opt/manifests/{}' \
    && cp yarn.lock /opt/manifests

# add shared folder
COPY shared  /opt/manifests/shared

#
# Build deps
#
FROM node:12-alpine as builder
LABEL Unlock <ops@unlock-protocol.com>

ARG BUILD_DIR=unlock-js

# Setting user as root to handle apk install
USER root

# install deps
RUN apk add --no-cache --virtual .build-deps \
    python2 \
    py-pip \
    # python2-dev \ 
    make \
    build-base \
    g++

# set home
RUN mkdir /home/unlock
RUN chown -R node /home/unlock
WORKDIR /home/unlock

# yarn config
COPY  --chown=node .yarn/ /home/unlock/.yarn/
COPY  --chown=node .yarnrc.yml /home/unlock/.yarnrc.yml

# copy packages info
COPY --chown=node --from=manifests /opt/manifests ./
COPY --chown=node package.json .
COPY --chown=node yarn.lock .

# add yarn cache folder to be used by docker buildkit 
RUN echo "cacheFolder: /home/unlock/yarn-cache" >> .yarnrc.yml 

# install node modules
USER node
RUN --mount=target=/home/unlock/yarn-cache,type=cache,uid=1000,gid=1000 yarn install 

# copy over required files
COPY --chown=node unlock-js/. unlock-js

# package/export standalone prod app (will strip dev deps)
WORKDIR /home/unlock/${BUILD_DIR}
RUN mkdir /home/unlock/prod
RUN chown -R node /home/unlock/prod
RUN --mount=target=/home/unlock/yarn-cache,type=cache,uid=1000,gid=1000 yarn prod-install /home/unlock/prod

# cleanup the image a bit
USER root
RUN apk del .build-deps

#
## Standalone packaged version for prod (no dev deps)
#
# FROM node:12-alpine as prod

# # copy files over
# COPY --chown=node:node --from=builder /home/unlock/out/ .

# USER node
# CMD ["yarn", "start"]

# #
# ## Dev version for prod (no dev deps)
# #
# FROM node:12-alpine as app
# ARG BUILD_DIR=unlock-js

# # Setting user as root to handle apk install
# USER root

# # set home
# RUN mkdir /home/unlock
# RUN chown -R node /home/unlock
# WORKDIR /home/unlock

# # yarn config
# COPY --chown=node --from=builder /home/unlock/.yarn .yarn
# COPY  --chown=node .yarnrc.yml /home/unlock/.yarnrc.yml

# # copy packages info
# COPY --chown=node package.json .
# COPY --chown=node yarn.lock .

# USER node
# WORKDIR /home/unlock

# # copy files over
# COPY --chown=node shared /home/unlock/shared
# COPY --chown=node ${BUILD_DIR} /home/unlock/${BUILD_DIR}

# # copy mode_modules over
# COPY --chown=node --from=builder /home/unlock/shared/eslint-config/node_modules shared/eslint-config/node_modules
# COPY --chown=node --from=builder /home/unlock/${BUILD_DIR}/node_modules ${BUILD_DIR}/node_modules

## TODO: for this to be really useful, we need to 1) get the yarn cache from the builder stage and 2)
## cherry-pick the yarn workspaces from the package
# RUN yarn install

# # ENV BUILD_DIR ${BUILD_DIR}
# # CMD [ "yarn", "workspace", , "run", "test"]
