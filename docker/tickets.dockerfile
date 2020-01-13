FROM unlock-core

# Dependencies for tickets
RUN mkdir /home/unlock/tickets
COPY --chown=node tickets/yarn.lock /home/unlock/tickets/.
COPY --chown=node tickets/package.json /home/unlock/tickets/.
WORKDIR /home/unlock/tickets
RUN yarn --production

# Build tickets
WORKDIR /home/unlock/tickets
COPY --chown=node tickets/ /home/unlock/tickets/.
RUN yarn build
EXPOSE 3003
CMD ["yarn", "start"]
