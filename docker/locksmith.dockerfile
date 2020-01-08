FROM unlock-core

# Dependencies for locksmith
RUN mkdir /home/unlock/locksmith
COPY --chown=node locksmith/yarn.lock /home/unlock/locksmith/.
COPY --chown=node locksmith/package.json /home/unlock/locksmith/.
WORKDIR /home/unlock/locksmith
RUN yarn --production

# Build Locksmith
COPY --chown=node locksmith/ /home/unlock/locksmith/.
RUN yarn build
EXPOSE 8080
