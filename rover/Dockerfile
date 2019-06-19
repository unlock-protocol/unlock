FROM node:8.11.4-alpine
LABEL Unlock <ops@unlock-protocol.com>
LABEL maintainer="ops@unlock-protocol.com"

RUN npm install -g npm@6.4.1
RUN npm install -g npm i @unlock-protocol/rover

EXPOSE 8080
ENTRYPOINT ["rover"]