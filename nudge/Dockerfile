FROM unlockprotocol/unlock-core

RUN mkdir /home/unlock/nudge
COPY --chown=node yarn.lock /home/unlock/nudge/.
COPY --chown=node package.json /home/unlock/nudge/.
WORKDIR /home/unlock/nudge

USER root

RUN apk add --update --no-cache --virtual .build-deps \
    git \
    python \
    python-dev \
    build-base \
    && yarn --production \
    && apk del .build-deps

USER node

COPY --chown=node ./ /home/unlock/nudge/.
RUN yarn build

EXPOSE 8787

CMD ["yarn", "start"]