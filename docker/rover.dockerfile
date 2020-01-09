FROM unlock-core 

RUN mkdir /home/unlock/rover
COPY --chown=node rover/yarn.lock /home/unlock/rover/.
COPY --chown=node rover/package.json /home/unlock/rover/.
WORKDIR /home/unlock/rover

RUN yarn

WORKDIR /home/unlock/rover
COPY --chown=node rover/ /home/unlock/rover/.
RUN yarn build
