FROM unlock-core

# Dependencies for smart-contract-extensions
RUN mkdir /home/unlock/smart-contract-extensions
COPY --chown=node smart-contract-extensions/yarn.lock /home/unlock/smart-contract-extensions/.
COPY --chown=node smart-contract-extensions/package.json /home/unlock/smart-contract-extensions/.
WORKDIR /home/unlock/smart-contract-extensions

USER root

RUN apk add --no-cache --virtual .build-deps-2 \
    git \
    python \
    build-base \
    && yarn \
    && apk del .build-deps-2

USER node


COPY --chown=node smart-contract-extensions/ /home/unlock/smart-contract-extensions/.
