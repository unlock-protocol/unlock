FROM unlockprotocol/unlock-core

RUN mkdir /home/unlock/nudge
COPY --chown=node yarn.lock /home/unlock/nudge/.
COPY --chown=node package.json /home/unlock/nudge/.
WORKDIR /home/unlock/nudge
RUN yarn --production

COPY --chown=node ./ /home/unlock/nudge/.
RUN yarn build

CMD ["yarn", "start"]