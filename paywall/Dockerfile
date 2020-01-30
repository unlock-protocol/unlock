FROM unlock-core

# Dependencies for paywall
RUN mkdir /home/unlock/paywall
COPY --chown=node yarn.lock /home/unlock/paywall/.
COPY --chown=node package.json /home/unlock/paywall/.
WORKDIR /home/unlock/paywall
RUN yarn --production

# Build paywall
COPY --chown=node . /home/unlock/paywall/.
RUN yarn build
EXPOSE 3001
CMD  ["yarn", "start"]
