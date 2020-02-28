FROM node:10.19.0-alpine
LABEL Locksmith <ops@unlock-protocol.com>
LABEL maintainer="ops@unlock-protocol.com"

# Adding git which is needed by some dependencies
RUN apk add --no-cache git openssh

# Adding python which is needed by some dependencies
RUN apk add --no-cache \
    python \
    python-dev \
    py-pip \
    build-base \
  && pip install virtualenv

# Update npm version to use npm ci
RUN npm install -g npm@6.4.1
RUN npm install -g yarn

# Dependencies for locksmith
RUN mkdir /locksmith
ADD VERSION .
COPY --chown=node ./yarn.lock /locksmith/.
COPY --chown=node ./package.json /locksmith/.
WORKDIR /locksmith
RUN yarn --production

WORKDIR /locksmith
COPY --chown=node . /locksmith/.
RUN yarn build
EXPOSE 8080
CMD ["yarn", "start"]
