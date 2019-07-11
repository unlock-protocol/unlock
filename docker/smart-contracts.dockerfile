FROM unlock-core

# Dependencies for smart-contracts
RUN mkdir /home/unlock/smart-contracts
COPY --chown=node smart-contracts/package-lock.json /home/unlock/smart-contracts/.
COPY --chown=node smart-contracts/package.json /home/unlock/smart-contracts/.
WORKDIR /home/unlock/smart-contracts
RUN npm ci --production

# Copy the parent binaries into the smart-contracts
WORKDIR /home/unlock/
RUN npm run link-parent-bin

# Build smart contract
WORKDIR /home/unlock/smart-contracts
COPY --chown=node smart-contracts/ /home/unlock/smart-contracts/.
RUN npm run build
