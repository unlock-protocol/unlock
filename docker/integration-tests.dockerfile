FROM alekzonder/puppeteer:1.1.1
LABEL Unlock <ops@unlock-protocol.com>

USER root

# update npm which is out of date on that image and does not have npm ci
RUN npm install -g npm@6.4.1

RUN mkdir /home/unlock
RUN chown -R pptruser /home/unlock
RUN mkdir /home/unlock/scripts
RUN chown -R pptruser /home/unlock

USER pptruser

WORKDIR /home/unlock/
# We need some of the packages installed in the root folder
COPY --chown=pptruser scripts/postinstall.sh /home/unlock/scripts/postinstall.sh
COPY --chown=pptruser package-lock.json /home/unlock/.
COPY --chown=pptruser package.json /home/unlock/.
RUN SKIP_SERVICES=true npm ci --production

# the eslint config inside test needs the root one
COPY .eslintrc.js /home/unlock/.eslintrc.js
COPY .prettierrc /home/unlock/.prettierrc

# Let's now copy all the tests stuff from unlock/tests
# And install things
RUN mkdir /home/unlock/tests
COPY tests/package-lock.json /home/unlock/tests/.
COPY tests/package.json /home/unlock/tests/.
WORKDIR /home/unlock/tests
RUN npm ci --production

# Copy the rest of test files
COPY tests/ /home/unlock/tests/.

WORKDIR /home/unlock/
# Copy the scripts which are used for builds
COPY --chown=node ./scripts /home/unlock/scripts

# Copy the parent binaries from the root into the children
RUN npm run link-parent-bin

WORKDIR /home/unlock/tests
