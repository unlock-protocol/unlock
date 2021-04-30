FROM alekzonder/puppeteer:1.1.1
LABEL Unlock <ops@unlock-protocol.com>

USER root

# Install more recent node (10) which comes with more recent npm and yarn
RUN npm install n -g
RUN n 10
RUN n use 10

RUN mkdir /home/unlock
RUN chown -R pptruser /home/unlock
RUN mkdir /home/unlock/scripts
RUN chown -R pptruser /home/unlock

USER pptruser

WORKDIR /home/unlock/

# the eslint config inside test needs the root one
COPY .eslintrc.js /home/unlock/.eslintrc.js
COPY .prettierrc /home/unlock/.prettierrc

# Let's now copy all the tests stuff from unlock/tests
# And install things
RUN mkdir /home/unlock/tests
COPY tests/yarn.lock /home/unlock/tests/.
COPY tests/package.json /home/unlock/tests/.
WORKDIR /home/unlock/tests
RUN yarn

# Copy the rest of test files
COPY tests/ /home/unlock/tests/.

WORKDIR /home/unlock/
# Copy the scripts which are used for builds
COPY --chown=node ./scripts /home/unlock/scripts

WORKDIR /home/unlock/tests
