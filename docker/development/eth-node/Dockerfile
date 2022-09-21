FROM node:16-alpine as unlock-eth-node
LABEL Unlock <ops@unlock-protocol.com>

USER root
RUN mkdir /app
RUN chown -R node:node /app

USER node
WORKDIR /app

# install deps
COPY --chown=node package.json package.json
COPY --chown=node yarn.lock yarn.lock
RUN yarn install --pure-lockfile

# add files
COPY --chown=node . .

EXPOSE 8545
CMD [  "yarn", "hardhat", "node", "--hostname", "0.0.0.0" ]
