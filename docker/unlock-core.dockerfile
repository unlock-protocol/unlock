FROM node:10.16.3-alpine
LABEL Unlock <ops@unlock-protocol.com>

# Adding bash which is missing from the based alpine image
RUN apk add --no-cache bash

# Adding git which is needed by some dependencies to install npm modules
RUN apk add --no-cache git openssh

# Adding python which is needed by some dependencies
RUN apk add --no-cache \
    python \
    python-dev \
    py-pip \
    build-base \
  && pip install virtualenv

# Update npm version 
RUN npm install -g npm@6.4.1
RUN npm install -g yarn

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
COPY --chown=node yarn.lock /home/unlock/.
COPY --chown=node package.json /home/unlock/.
COPY --chown=node .eslintrc.js /home/unlock/.
COPY --chown=node .prettierrc /home/unlock/.
RUN yarn --production

WORKDIR /home/unlock/
