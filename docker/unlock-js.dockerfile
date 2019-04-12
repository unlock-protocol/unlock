FROM unlock-core

# Dependencies for unlock-js
RUN mkdir /home/unlock/unlock-js
COPY --chown=node unlock-js/package-lock.json /home/unlock/unlock-js/.
COPY --chown=node unlock-js/package.json /home/unlock/unlock-js/.
WORKDIR /home/unlock/unlock-js
RUN npm ci

# Copy the parent binaries into the unlock-js
WORKDIR /home/unlock/
RUN npm run link-parent-bin

# Build unlock-js
WORKDIR /home/unlock/unlock-js
COPY --chown=node unlock-js/ /home/unlock/unlock-js/.
RUN npm run build