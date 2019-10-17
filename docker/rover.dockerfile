FROM unlock-core 

RUN mkdir /home/unlock/rover
COPY --chown=node rover/package-lock.json /home/unlock/rover/.
COPY --chown=node rover/package.json /home/unlock/rover/.
WORKDIR /home/unlock/rover

RUN npm ci

WORKDIR /home/unlock/rover
COPY --chown=node rover/ /home/unlock/rover/.
RUN npm run build
