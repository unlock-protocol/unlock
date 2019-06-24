FROM node:8.11.4-alpine
LABEL Unlock <ops@unlock-protocol.com>
LABEL maintainer="ops@unlock-protocol.com"

RUN npm install -g npm@6.4.1
RUN npm install -g npm i @unlock-protocol/rover@0.1.4

EXPOSE 4242
ENTRYPOINT ["rover"]