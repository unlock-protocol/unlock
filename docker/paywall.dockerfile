FROM unlock-core

# Dependencies for paywall
RUN mkdir /home/unlock/paywall
COPY --chown=node paywall/package-lock.json /home/unlock/paywall/.
COPY --chown=node paywall/package.json /home/unlock/paywall/.
WORKDIR /home/unlock/paywall
RUN npm ci --production

# Copy the parent binaries into the paywall
WORKDIR /home/unlock/
RUN npm run link-parent-bin

# Build paywall
WORKDIR /home/unlock/paywall
COPY --chown=node paywall/ /home/unlock/paywall/.
RUN npm run build