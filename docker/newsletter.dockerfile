FROM unlockprotocol/unlock-core:master

# Dependencies for newsletter
RUN mkdir /home/unlock/newsletter
COPY --chown=node newsletter/yarn.lock /home/unlock/newsletter/.
COPY --chown=node newsletter/package.json /home/unlock/newsletter/.
WORKDIR /home/unlock/newsletter
RUN yarn --production

# Build newsletter
COPY --chown=node newsletter/ /home/unlock/newsletter/.

EXPOSE 3003
CMD ["yarn", "start"]
