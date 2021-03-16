FROM unlock-core

# Dependencies for Unlock app
RUN mkdir /home/unlock/unlock-app
COPY --chown=node unlock-app/yarn.lock /home/unlock/unlock-app/.
COPY --chown=node unlock-app/package.json /home/unlock/unlock-app/.
WORKDIR /home/unlock/unlock-app

USER root

RUN apk add --no-cache --virtual .build-deps-2 \
    git \
    python \
    build-base \
    && yarn --production \
    && apk del .build-deps-2

USER node
# Build unlock-app
COPY --chown=node unlock-app/ /home/unlock/unlock-app/.

# Copy the .git stuff
# We do this last because this can never be cached (every commit will change it...)
WORKDIR /home/unlock/
COPY --chown=node .git/ /home/unlock/.git/.

WORKDIR /home/unlock/unlock-app
EXPOSE 3000
CMD ["yarn", "start"]
