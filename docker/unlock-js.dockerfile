FROM unlockprotocol/unlock-core

# Dependencies for unlock-js
RUN mkdir /home/unlock/unlock-js
COPY --chown=node unlock-js/yarn.lock /home/unlock/unlock-js/.
COPY --chown=node unlock-js/package.json /home/unlock/unlock-js/.
WORKDIR /home/unlock/unlock-js

USER root

RUN apk add --no-cache --virtual .build-deps \
    git \
    python \
    build-base \
    && yarn \
    && apk del .build-deps

USER node

# Build unlock-js
COPY --chown=node unlock-js/ /home/unlock/unlock-js/.
