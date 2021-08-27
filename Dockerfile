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

# Build deps
FROM node:12-alpine as builder
LABEL Unlock <ops@unlock-protocol.com>

ARG BUILD_DIR=smart-contracts

RUN mkdir /home/unlock
RUN chown -R node /home/unlock
WORKDIR /home/unlock

# yarn config
COPY .yarn/ /home/unlock/.yarn/
COPY .yarnrc.yml /home/unlock/.yarnrc.yml

COPY package.json .

# install deps
COPY --from=manifests /opt/manifests ./

# add useful plugin
RUN yarn set version berry &&  \
    # yarn plugin import workspace-tools && \
    yarn set version 2.4.2

# add yarn cache 
RUN echo "cacheFolder: /yarn" >> .yarnrc.yml 

# install deps
RUN --mount=target=/yarn,type=cache \ 
    apk add --no-cache --virtual .build-deps \
    python2 \
    make \
    build-base \
    g++ \
    && yarn install --inline-builds \ 
    && apk del .build-deps

## Now run the actual thing
FROM node:12-alpine
ARG BUILD_DIR=smart-contracts

WORKDIR /home/unlock

# copy files over
COPY --from=builder /home/unlock/shared /home/unlock/shared
COPY --from=builder /home/unlock/${BUILD_DIR} /home/unlock/

WORKDIR ${BUILD_DIR}
