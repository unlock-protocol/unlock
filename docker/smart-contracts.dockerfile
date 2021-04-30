FROM unlock-core

# Dependencies for smart-contracts
RUN mkdir /home/unlock/smart-contracts
COPY --chown=node smart-contracts/yarn.lock /home/unlock/smart-contracts/.
COPY --chown=node smart-contracts/package.json /home/unlock/smart-contracts/.
WORKDIR /home/unlock/smart-contracts

USER root

RUN apk add --no-cache --virtual .build-deps-2 \
    git \
    python \
    build-base \
    && yarn \
    && apk del .build-deps-2

USER node

COPY --chown=node smart-contracts/ /home/unlock/smart-contracts/.
