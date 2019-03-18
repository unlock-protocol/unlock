FROM node:8.11.4-alpine
LABEL Unlock <ops@unlock-protocol.com>

# Adding bash which is missing from the based alpine image
RUN apk add --no-cache bash

# Adding git which is needed by some dependencies
RUN apk add --no-cache git openssh

# Adding python which is needed by some dependencies
RUN apk add --no-cache \
    python \
    python-dev \
    py-pip \
    build-base \
  && pip install virtualenv

# Update npm version to use cpm ci
RUN npm install -g npm@6.4.1

RUN mkdir /home/unlock
RUN mkdir /home/unlock/scripts
RUN chown -R node /home/unlock
WORKDIR /home/unlock

USER node

# To leverage the docker caching it is better to install the deps
# before the file changes. This will allow docker to not install
# dependencies again if they are not changed.

COPY --chown=node scripts/postinstall.sh /home/unlock/scripts/postinstall.sh
COPY --chown=node package-lock.json /home/unlock/.
COPY --chown=node package.json /home/unlock/.
RUN SKIP_SERVICES=true npm ci --production

# Note: we do not build the test directory because it is built in its own image

# Dependencies for smart contracts
RUN mkdir /home/unlock/smart-contracts
COPY --chown=node smart-contracts/package-lock.json /home/unlock/smart-contracts/.
COPY --chown=node smart-contracts/package.json /home/unlock/smart-contracts/.
WORKDIR /home/unlock/smart-contracts
RUN npm ci --production

# Dependencies for locksmith
RUN mkdir /home/unlock/locksmith
COPY --chown=node locksmith/package-lock.json /home/unlock/locksmith/.
COPY --chown=node locksmith/package.json /home/unlock/locksmith/.
WORKDIR /home/unlock/locksmith
RUN npm ci --production

# Dependencies for Unlock app
RUN mkdir /home/unlock/unlock-app
COPY --chown=node unlock-app/package-lock.json /home/unlock/unlock-app/.
COPY --chown=node unlock-app/package.json /home/unlock/unlock-app/.
WORKDIR /home/unlock/unlock-app
RUN npm ci --production

# Dependencies for Paywall
RUN mkdir /home/unlock/paywall
COPY --chown=node paywall/package-lock.json /home/unlock/paywall/.
COPY --chown=node paywall/package.json /home/unlock/paywall/.
WORKDIR /home/unlock/paywall
RUN npm ci --production

# Dependencies for Wedlocks
RUN mkdir /home/unlock/wedlocks
COPY --chown=node wedlocks/package-lock.json /home/unlock/wedlocks/.
COPY --chown=node wedlocks/package.json /home/unlock/wedlocks/.
WORKDIR /home/unlock/wedlocks
RUN npm ci --production

WORKDIR /home/unlock/
# Copy the scripts which are used for builds
COPY --chown=node ./scripts /home/unlock/scripts

# Copy the parent binaries into the children
WORKDIR /home/unlock/
RUN npm run link-parent-bin

# Build smart contract
WORKDIR /home/unlock/smart-contracts
COPY --chown=node smart-contracts/ /home/unlock/smart-contracts/.
RUN npm run build

# Build locksmith
WORKDIR /home/unlock/locksmith
COPY --chown=node locksmith/ /home/unlock/locksmith/.
RUN npm run build

# Build Unlock app
WORKDIR /home/unlock/unlock-app
COPY --chown=node unlock-app/ /home/unlock/unlock-app/.
RUN npm run build

# Build paywall
WORKDIR /home/unlock/paywall
COPY --chown=node paywall/ /home/unlock/paywall/.
RUN npm run build

# Build wedlocks
WORKDIR /home/unlock/wedlocks
COPY --chown=node wedlocks/ /home/unlock/wedlocks/.
RUN npm run build

WORKDIR /home/unlock/

# Copy the rest of the application code
COPY --chown=node . /home/unlock
