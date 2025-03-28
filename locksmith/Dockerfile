# Build stage
FROM node:22.13.1-alpine3.21 AS builder

# Set working directory
WORKDIR /app

# Enable corepack and set yarn version
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# Install Java for OpenAPI Generator
RUN apk add --no-cache openjdk11

# Copy the entire repository
COPY . .

# Install dependencies
RUN yarn install

# Build all packages
RUN yarn build

# Production stage
FROM node:22.13.1-alpine3.21 AS runner

# Set working directory for the app
WORKDIR /app

# Enable corepack and set yarn version
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# Install necessary dependencies for 1Password CLI
RUN apk add --no-cache curl unzip ca-certificates

# Setup 1Password CLI
RUN ARCH="amd64"; \
    OP_VERSION="v$(curl https://app-updates.agilebits.com/check/1/0/CLI2/en/2.0.0/N -s | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+')"; \
    curl -sSfo op.zip \
    https://cache.agilebits.com/dist/1P/op2/pkg/"$OP_VERSION"/op_linux_"$ARCH"_"$OP_VERSION".zip \
    && unzip -od /usr/local/bin/ op.zip \
    && rm op.zip

# Copy built files from builder stage
COPY --from=builder /app /app

# Install production dependencies; skipped build steps as code is already built
RUN yarn install --mode=skip-build

# Make sure start.sh script is executable
RUN chmod +x /app/locksmith/scripts/start.sh

# Change to locksmith directory for the final command
WORKDIR /app/locksmith

# Expose port
EXPOSE 8080

# Start locksmith using its start script
CMD ["yarn", "start"]