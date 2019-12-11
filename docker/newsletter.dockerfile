FROM unlock-core

# Dependencies for newsletter
RUN mkdir /home/unlock/newsletter
COPY --chown=node newsletter/package-lock.json /home/unlock/newsletter/.
COPY --chown=node newsletter/package.json /home/unlock/newsletter/.
WORKDIR /home/unlock/newsletter
RUN npm ci --production

# Copy the parent binaries into the newsletter
WORKDIR /home/unlock/
RUN npm run link-parent-bin

# Build newsletter
WORKDIR /home/unlock/newsletter
COPY --chown=node newsletter/ /home/unlock/newsletter/.
RUN npm run build