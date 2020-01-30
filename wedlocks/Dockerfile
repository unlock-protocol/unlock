FROM unlock-core

# Dependencies for wedlocks
RUN mkdir /home/unlock/wedlocks
COPY --chown=node yarn.lock /home/unlock/wedlocks/.
COPY --chown=node package.json /home/unlock/wedlocks/.
WORKDIR /home/unlock/wedlocks
RUN yarn --production

# Build wedlocks
COPY --chown=node . /home/unlock/wedlocks/.
RUN yarn build
