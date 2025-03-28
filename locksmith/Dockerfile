# Build stage
FROM node:22.13.1-alpine3.21 AS builder

# Install OpenJDK for tools like OpenAPI Generator
RUN apk add --no-cache openjdk11

# Set working directory to the monorepo root
WORKDIR /app

# Setup corepack and prepare yarn
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# Configure Yarn to use node-modules linker to ensure node_modules are created
RUN yarn config set nodeLinker node-modules

# Copy dependency files to leverage Docker cache
COPY package.json yarn.lock ./

# Install all workspace dependencies
RUN yarn install

# Copy the entire repository
COPY . .

# Build all workspace packages
RUN yarn build


# Production stage
FROM node:22.13.1-alpine3.21 AS runner

# Set working directory to the locksmith package
WORKDIR /app/locksmith

# Install necessary system dependencies for 1Password CLI
RUN apk add --no-cache curl unzip ca-certificates

# Setup corepack and prepare yarn
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# Setup 1Password CLI
RUN ARCH="amd64"; \
    OP_VERSION="v$(curl -s https://app-updates.agilebits.com/check/1/0/CLI2/en/2.0.0/N | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+')"; \
    curl -sSfo op.zip https://cache.agilebits.com/dist/1P/op2/pkg/"$OP_VERSION"/op_linux_"$ARCH"_"$OP_VERSION".zip && \
    unzip -od /usr/local/bin/ op.zip && rm op.zip

# Copy built files and complete source from the builder stage
COPY --from=builder /app /app

# Install production dependencies (skip rebuild steps since code is already built)
RUN cd /app && yarn install --mode=skip-build

# Ensure locksmith scripts have execution permissions
RUN chmod +x /app/locksmith/scripts/*.sh

# Expose the application port
EXPOSE 8080

# Start locksmith using the yarn command (referring to the start script in package.json)
CMD ["yarn", "start"]