FROM unlock-core

# Dependencies for smart-contracts
RUN mkdir /home/unlock/smart-contracts
COPY --chown=node yarn.lock /home/unlock/smart-contracts/.
COPY --chown=node package.json /home/unlock/smart-contracts/.
WORKDIR /home/unlock/smart-contracts
RUN yarn --production

# Build smart contract
COPY --chown=node . /home/unlock/smart-contracts/.
RUN yarn build
