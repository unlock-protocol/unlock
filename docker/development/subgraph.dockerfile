FROM node:10.17.0-alpine
LABEL Graph Protocol Subgraph <ops@unlock-protocol.com>
LABEL maintainer="ops@unlock-protocol.com"

RUN apk add --no-cache git openssh libsecret-dev
RUN apk add --no-cache \
    python \
    python-dev \
    py-pip \
    build-base \
    && pip install virtualenv

RUN npm install -g npm@6.4.1
RUN git clone https://github.com/unlock-protocol/unlock-subgraph.git
WORKDIR /unlock-subgraph
RUN git pull
RUN git checkout local_dev

COPY --chown=node ./deploy-subgraph.js /unlock-subgraph/.

RUN npm ci
RUN npm run codegen
RUN npm run build