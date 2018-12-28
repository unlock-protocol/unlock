FROM node:8.11.4
RUN npm install -g npm@latest
RUN mkdir /home/unlock
COPY . /home/unlock
RUN chown -R node /home/unlock
USER node
WORKDIR /home/unlock
RUN npm ci

