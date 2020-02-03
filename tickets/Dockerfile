FROM unlock-core

# Dependencies for tickets
RUN mkdir /home/unlock/tickets
COPY --chown=node yarn.lock /home/unlock/tickets/.
COPY --chown=node package.json /home/unlock/tickets/.
WORKDIR /home/unlock/tickets
RUN yarn --production

# Build tickets
WORKDIR /home/unlock/tickets
COPY --chown=node . /home/unlock/tickets/.
RUN yarn build
EXPOSE 3003
CMD ["yarn", "start"]
