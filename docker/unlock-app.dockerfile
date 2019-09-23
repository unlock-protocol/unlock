FROM unlock-core

# Dependencies for Unlock app
RUN mkdir /home/unlock/unlock-app
COPY --chown=node unlock-app/package-lock.json /home/unlock/unlock-app/.
COPY --chown=node unlock-app/package.json /home/unlock/unlock-app/.
WORKDIR /home/unlock/unlock-app
RUN npm ci --production

# Copy the parent binaries into the unlock-app
WORKDIR /home/unlock/
RUN npm run link-parent-bin

# Build unlock-app
WORKDIR /home/unlock/unlock-app
COPY --chown=node unlock-app/ /home/unlock/unlock-app/.
RUN npm run build

# Copy the .git stuff
# We do this last because this can never be cached (every commit will change it...)
WORKDIR /home/unlock/
COPY --chown=node .git/ /home/unlock/.git/.

WORKDIR /home/unlock/unlock-app
