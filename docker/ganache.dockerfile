FROM trufflesuite/ganache-cli:v6.4.3
LABEL Unlock <ops@unlock-protocol.com>

RUN apk add --no-cache git openssh bash 

RUN npm install -g npm@6.4.1

RUN mkdir /standup
WORKDIR /standup

COPY ./docker/deploy-unlock.js .
COPY ./docker/package.json .
COPY ./docker/package-lock.json .
COPY ./docker/TestErc20Token.json .

RUN npm install
WORKDIR /app
COPY ./docker/standup.sh .

ENV DOCKER true
EXPOSE 8545

ENTRYPOINT ["/bin/bash", "/app/standup.sh"]