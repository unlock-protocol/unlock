FROM unlock-core

# Dependencies for paywall
RUN mkdir /home/unlock/paywall
COPY --chown=node paywall/yarn.lock /home/unlock/paywall/.
COPY --chown=node paywall/package.json /home/unlock/paywall/.
WORKDIR /home/unlock/paywall
RUN yarn


COPY --chown=node paywall/ /home/unlock/paywall/.

# Create folder for export
RUN mkdir out

EXPOSE 3001
CMD ["yarn", "start"]
