FROM unlock-core

# Dependencies for unlock-js
RUN mkdir /home/unlock/unlock-js
COPY --chown=node unlock-js/package-lock.json /home/unlock/unlock-js/.
COPY --chown=node unlock-js/package.json /home/unlock/unlock-js/.
WORKDIR /home/unlock/unlock-js
RUN yarn

# Build unlock-js
COPY --chown=node unlock-js/ /home/unlock/unlock-js/.
RUN yarn build
