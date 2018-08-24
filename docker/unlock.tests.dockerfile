FROM truffle/ci
RUN npm install -g .
RUN mkdir /home/unlock
COPY . /home/unlock
WORKDIR /home/unlock

ENV NODE_ENV=test
CMD ./tests.sh