FROM unlockprotocol/unlock-core

RUN mkdir /home/unlock/nudge
COPY --chown=node nudge/yarn.lock /home/unlock/nudge/.
COPY --chown=node nudge/package.json /home/unlock/nudge/.
WORKDIR /home/unlock/nudge

USER root

RUN apk add --no-cache --virtual .build-deps \
    git \
    python \
    build-base \
    && yarn --production \
    && apk del .build-deps

USER node

COPY --chown=node nudge/ /home/unlock/nudge/.

CMD ["yarn", "start"]