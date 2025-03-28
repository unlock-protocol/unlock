# syntax = docker/dockerfile:experimental
FROM node:22.14.0-bullseye as deps
LABEL Unlock <ops@unlock-protocol.com>

# Install required dependencies
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends --assume-yes \
    bash git rsync python3 postgresql default-jdk build-essential ca-certificates unzip

# Setup 1Password CLI
RUN ARCH="amd64"; \
    OP_VERSION="v$(curl https://app-updates.agilebits.com/check/1/0/CLI2/en/2.0.0/N -s | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+')"; \
    curl -sSfo op.zip \
    https://cache.agilebits.com/dist/1P/op2/pkg/"$OP_VERSION"/op_linux_"$ARCH"_"$OP_VERSION".zip \
    && unzip -od /usr/local/bin/ op.zip \
    && rm op.zip

# Setup folder
ENV DEST_FOLDER=/home/unlock
RUN mkdir $DEST_FOLDER
WORKDIR ${DEST_FOLDER}

# Copy yarn configuration
COPY yarn.lock .
COPY .yarnrc.yml .
COPY .yarn/plugins .yarn/plugins
COPY .yarn/releases .yarn/releases
COPY .yarn/patches .yarn/patches

# Copy package.json files from all required packages
COPY package.json .
COPY packages/*/package.json ./packages/
COPY locksmith/package.json ./locksmith/
COPY subgraph/package.json ./subgraph/

# Setup directories for packages
RUN mkdir -p packages/core packages/networks packages/contracts packages/types packages/unlock-js packages/ui packages/tsconfig packages/eslint-config
RUN mkdir -p locksmith subgraph

# Use custom yarn cache folder
RUN echo "cacheFolder: ${DEST_FOLDER}/yarn-cache" >> .yarnrc.yml
RUN mkdir ./yarn-cache
RUN chown -R node:node .

# Install dependencies
USER node
RUN yarn install

# Build stage
FROM deps as build

# Copy source code
COPY --chown=node packages/ ./packages/
COPY --chown=node locksmith/ ./locksmith/
COPY --chown=node subgraph/ ./subgraph/

# Build packages
USER node
RUN yarn build

# Production stage
FROM node:22.14.0-bullseye as runner

# Set working directory
WORKDIR /app/locksmith

# Copy built files
COPY --from=build /home/unlock/locksmith ./
COPY --from=build /home/unlock/node_modules ../node_modules
COPY --from=build /home/unlock/packages ../packages

# Make scripts executable
RUN chmod +x ./scripts/*.sh

# Expose port
EXPOSE 3000

# Start locksmith server
CMD ["yarn", "scripts/start.sh", "server"] 