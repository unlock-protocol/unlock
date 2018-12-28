FROM node:8.11.4
RUN mkdir /home/unlock
COPY . /home/unlock
WORKDIR /home/unlock
RUN npm install -g npm@latest
