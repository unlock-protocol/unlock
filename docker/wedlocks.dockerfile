FROM unlock-core

# Dependencies for wedlocks
RUN mkdir /home/unlock/wedlocks
COPY --chown=node wedlocks/package-lock.json /home/unlock/wedlocks/.
COPY --chown=node wedlocks/package.json /home/unlock/wedlocks/.
WORKDIR /home/unlock/wedlocks
RUN npm ci --production

# Copy the parent binaries into the wedlocks
WORKDIR /home/unlock/
RUN npm run link-parent-bin

# Build smart contract
WORKDIR /home/unlock/wedlocks
COPY --chown=node wedlocks/ /home/unlock/wedlocks/.
RUN npm run build