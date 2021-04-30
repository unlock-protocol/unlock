FROM unlock-core

# Dependencies for unlock-protocol.com
RUN mkdir /home/unlock/unlock-protocol.com
COPY --chown=node unlock-protocol.com/yarn.lock /home/unlock/unlock-protocol.com/.
COPY --chown=node unlock-protocol.com/package.json /home/unlock/unlock-protocol.com/.
WORKDIR /home/unlock/unlock-protocol.com
RUN yarn

# Build Unlock app
COPY --chown=node unlock-protocol.com/ /home/unlock/unlock-protocol.com/.

EXPOSE 3002
CMD ["yarn", "start"]
