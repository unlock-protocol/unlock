FROM unlock-core

# Dependencies for unlock-protocol.com
RUN mkdir /home/unlock/unlock-protocol.com
COPY --chown=node unlock-protocol.com/package-lock.json /home/unlock/unlock-protocol.com/.
COPY --chown=node unlock-protocol.com/package.json /home/unlock/unlock-protocol.com/.
WORKDIR /home/unlock/unlock-protocol.com
RUN npm ci --production

# Copy the parent binaries into the unlock-protocol.com
WORKDIR /home/unlock/
RUN npm run link-parent-bin

# Build Unlock app
WORKDIR /home/unlock/unlock-protocol.com
COPY --chown=node unlock-protocol.com/ /home/unlock/unlock-protocol.com/.
RUN npm run build
