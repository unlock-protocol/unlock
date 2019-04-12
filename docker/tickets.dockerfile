FROM unlock-core

# Dependencies for tickets
RUN mkdir /home/unlock/tickets
COPY --chown=node tickets/package-lock.json /home/unlock/tickets/.
COPY --chown=node tickets/package.json /home/unlock/tickets/.
WORKDIR /home/unlock/tickets
RUN npm ci --production

# Copy the parent binaries into the tickets
WORKDIR /home/unlock/
RUN npm run link-parent-bin

# Build tickets
WORKDIR /home/unlock/tickets
COPY --chown=node tickets/ /home/unlock/tickets/.
RUN npm run build