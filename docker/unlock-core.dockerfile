FROM node:10.24.0-alpine
LABEL Unlock <ops@unlock-protocol.com>

RUN mkdir /home/unlock
RUN mkdir /home/unlock/scripts
RUN chown -R node /home/unlock
WORKDIR /home/unlock

# To leverage the docker caching it is better to install the deps
# before the file changes. This will allow docker to not install
# dependencies again if they are not changed.

COPY --chown=node yarn.lock /home/unlock/.
COPY --chown=node package.json /home/unlock/.
COPY --chown=node .eslintrc.js /home/unlock/.
COPY --chown=node .prettierrc /home/unlock/.

# Setting user as root to handle apk install
USER root

# apk steps merged to leverage virtual install of package
# allowing for removal after yarn dependencies install
RUN apk add --no-cache --virtual .build-deps \
    bash \
    git \
    openssh \
    python \
    python-dev \
    py-pip \
    build-base \
    && pip install --no-cache-dir virtualenv \
    && SKIP_SERVICES=true yarn \
    && apk del .build-deps \
    && apk add bash

USER node
WORKDIR /home/unlock/
