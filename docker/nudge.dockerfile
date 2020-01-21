FROM unlock-core

RUN mkdir /home/unlock/nudge
COPY --chown=node nudge/yarn.lock /home/unlock/nudge/.
COPY --chown=node nudge/package.json /home/unlock/nudge/.
WORKDIR /home/unlock/nudge
RUN yarn --production

COPY --chown=node nudge/ /home/unlock/nudge/.
RUN yarn build

CMD ["yarn", "start"]