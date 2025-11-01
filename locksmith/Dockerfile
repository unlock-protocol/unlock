FROM node:24.11.0-alpine3.21

# Set working directory
WORKDIR /app

# Install system dependencies (Java, bash, utils)
RUN apk add --no-cache openjdk11 bash curl unzip ca-certificates

# Setup 1Password CLI
RUN ARCH="amd64"; \
    OP_VERSION="v$(curl https://app-updates.agilebits.com/check/1/0/CLI2/en/2.0.0/N -s | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+')"; \
    curl -sSfo op.zip \
    https://cache.agilebits.com/dist/1P/op2/pkg/"$OP_VERSION"/op_linux_"$ARCH"_"$OP_VERSION".zip \
    && unzip -od /usr/local/bin/ op.zip \
    && rm op.zip

# Enable corepack and set yarn version
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# Copy the entire repository
COPY . .

# Install dependencies and build
RUN yarn install && yarn rebuild && yarn build

# Change to locksmith directory for the final command
WORKDIR /app/locksmith

# Expose port
EXPOSE 8080
