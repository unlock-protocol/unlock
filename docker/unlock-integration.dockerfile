FROM alekzonder/puppeteer:1.1.1
LABEL Unlock <ops@unlock-protocol.com>

USER root

# update npm which is out of date on that image and does not have npm ci
RUN npm install -g npm@6.4.1

RUN mkdir /home/unlock
RUN chown -R pptruser /home/unlock

USER pptruser

# Let's now copy all the tests stuff from unlock/tests
# And install things
RUN mkdir /home/unlock/tests
COPY tests/package-lock.json /home/unlock/tests/.
COPY tests/package.json /home/unlock/tests/.
WORKDIR /home/unlock/tests
RUN npm ci --production

# Copy the rest of files
COPY tests/ /home/unlock/tests/.