FROM unlock-core

# Dependencies for smart-contracts
RUN mkdir /home/unlock/smart-contracts
COPY --chown=node smart-contracts/package-lock.json /home/unlock/smart-contracts/.
COPY --chown=node smart-contracts/package.json /home/unlock/smart-contracts/.
WORKDIR /home/unlock/smart-contracts
RUN yarn --production

# Build smart contract
COPY --chown=node smart-contracts/ /home/unlock/smart-contracts/.
RUN yarn build
