FROM unlock-core

# Dependencies for unlock-js
RUN mkdir /home/unlock/unlock-js
COPY --chown=node yarn.lock /home/unlock/unlock-js/.
COPY --chown=node package.json /home/unlock/unlock-js/.
WORKDIR /home/unlock/unlock-js
RUN yarn

# Build unlock-js
COPY --chown=node . /home/unlock/unlock-js/.
RUN yarn build
