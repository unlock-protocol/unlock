FROM unlock-core

# Dependencies for wedlocks
RUN mkdir /home/unlock/wedlocks
COPY --chown=node wedlocks/yarn.lock /home/unlock/wedlocks/.
COPY --chown=node wedlocks/package.json /home/unlock/wedlocks/.
WORKDIR /home/unlock/wedlocks
RUN yarn --production

# Build wedlocks
COPY --chown=node wedlocks/ /home/unlock/wedlocks/.
RUN yarn build
