FROM trufflesuite/ganache-cli:v6.9.1
LABEL Unlock <ops@unlock-protocol.com>

RUN apk add --no-cache git openssh bash

# Adding python which is needed by some dependencies (keccak...)
RUN apk add --no-cache \
  python \
  python-dev \
  py-pip \
  build-base \
  && pip install virtualenv

RUN npm install -g npm@6.4.1
RUN npm install -g yarn

RUN mkdir /standup
WORKDIR /standup

COPY ./package.json ./

RUN yarn

COPY ./* ./
COPY ./utils/* ./utils/

WORKDIR /app

COPY ./standup.sh .

ENV DOCKER true
EXPOSE 8545

ENTRYPOINT /app/standup.sh
