FROM unlock-core

# Dependencies for locksmith
RUN mkdir /home/unlock/locksmith
COPY --chown=node locksmith/package-lock.json /home/unlock/locksmith/.
COPY --chown=node locksmith/package.json /home/unlock/locksmith/.
WORKDIR /home/unlock/locksmith
RUN npm ci --production

# Copy the parent binaries into the unlock-app
WORKDIR /home/unlock/
RUN npm run link-parent-bin

# Build Locksmith
WORKDIR /home/unlock/locksmith
COPY --chown=node locksmith/ /home/unlock/locksmith/.
RUN npm run build