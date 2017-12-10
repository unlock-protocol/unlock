FROM mhart/alpine-node

ENV NPM_CONFIG_LOGLEVEL warn

WORKDIR /unlock

COPY package.json ./package.json
RUN npm install
COPY . ./

RUN npm install -g http-server

RUN npm build

EXPOSE 3000

CMD ["cd", "build", "&&", "hs", "-p", "3000"]
