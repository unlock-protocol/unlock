FROM unlockprotocol/unlock-core

# Dependencies for locksmith
RUN mkdir /home/unlock/locksmith
COPY --chown=node locksmith/yarn.lock /home/unlock/locksmith/.
COPY --chown=node locksmith/package.json /home/unlock/locksmith/.
WORKDIR /home/unlock/locksmith

USER root

RUN apk add --no-cache --virtual .build-deps \
    git \
    python \
    build-base \
    && yarn --production \
    && apk del .build-deps

USER node
# Build Locksmith
COPY --chown=node locksmith/ /home/unlock/locksmith/.

EXPOSE 8080
CMD ["yarn", "start"]