FROM node:12-alpine as unlock-eth-node
LABEL Unlock <ops@unlock-protocol.com>

USER node
WORKDIR /app

# install deps
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install --pure-lockfile

# add files
COPY . .

RUN chown node:node /app

EXPOSE 8545
CMD [ "yarn", "start" ]
