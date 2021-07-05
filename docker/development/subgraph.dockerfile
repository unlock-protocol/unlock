FROM node:12-alpine
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
ADD https://api.github.com/repos/unlock-protocol/unlock-subgraph/git/matching-refs/heads/master version.json
RUN git clone https://github.com/unlock-protocol/unlock-subgraph.git
WORKDIR /unlock-subgraph

COPY --chown=node ./deploy-subgraph.js /unlock-subgraph/.

RUN npm ci
RUN ["npm", "run", "generate-subgraph-yaml"]
RUN ["npm", "run", "codegen"]