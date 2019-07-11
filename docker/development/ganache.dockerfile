FROM trufflesuite/ganache-cli:v6.4.3
LABEL Unlock <ops@unlock-protocol.com>

ARG blocktime=3
ENV BLOCKTIME=${blocktime}

RUN apk add --no-cache git openssh bash

# Adding python which is needed by some dependencies (keccak...)
RUN apk add --no-cache \
  python \
  python-dev \
  py-pip \
  build-base \
  && pip install virtualenv

RUN npm install -g npm@6.4.1

RUN mkdir /standup
WORKDIR /standup

COPY ./package.json .

RUN npm install

COPY ./TestErc20Token.json .
COPY ./deploy-unlock.js .
COPY ./deploy-locks.js .

WORKDIR /app

COPY ./standup.sh .

ENV DOCKER true
EXPOSE 8545

ENTRYPOINT /app/standup.sh ${BLOCKTIME}