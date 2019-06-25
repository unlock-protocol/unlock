FROM trufflesuite/ganache-cli:v6.4.3
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

RUN mkdir /standup
WORKDIR /standup

COPY ./deploy-unlock.js .
COPY ./deploy-locks.js .
COPY ./package.json .
COPY ./package-lock.json .
COPY ./TestErc20Token.json .

RUN npm install
WORKDIR /app
COPY ./standup.sh .

ENV DOCKER true
EXPOSE 8545

ENTRYPOINT ["/bin/bash", "/app/standup.sh"]