FROM unlock-core

# Dependencies for unlock-protocol.com
RUN mkdir /home/unlock/unlock-protocol.com
COPY --chown=node yarn.lock /home/unlock/unlock-protocol.com/.
COPY --chown=node package.json /home/unlock/unlock-protocol.com/.
WORKDIR /home/unlock/unlock-protocol.com
RUN yarn --production

# Build Unlock app
COPY --chown=node . /home/unlock/unlock-protocol.com/.
RUN yarn build

EXPOSE 3002
CMD ["yarn", "start"]
