FROM node:12-alpine as unlock-eth-node
LABEL Unlock <ops@unlock-protocol.com>

USER node
WORKDIR /app

# install deps
COPY --chown=node package.json package.json
COPY --chown=node yarn.lock yarn.lock
RUN yarn install --pure-lockfile

# add files
COPY --chown=node . .

RUN chown node:node /app

EXPOSE 8545
CMD [ "yarn", "start" ]
