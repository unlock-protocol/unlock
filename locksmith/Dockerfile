# Build stage
FROM node:22.13.1-alpine3.21 AS builder

# Set working directory
WORKDIR /app

# Enable corepack and set yarn version
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# Copy the entire repository
COPY . .

# Install dependencies
RUN yarn install

# Build all packages
RUN yarn build

# Production stage
FROM node:22.13.1-alpine3.21 AS runner

# Set working directory
WORKDIR /app

# Enable corepack and set yarn version
RUN corepack enable && corepack prepare yarn@4.6.0 --activate

# Copy built files from builder stage
COPY --from=builder /app .

# Install production dependencies; skipped build steps as code is already built
RUN yarn install --mode=skip-build

# Set environment variables
ENV NODE_ENV=production

# Add Railway specific ARGs and persist them into ENV
ARG RAILWAY_DEPLOYMENT_ID
ARG DATABASE_URL
ENV RAILWAY_DEPLOYMENT_ID=$RAILWAY_DEPLOYMENT_ID
ENV DATABASE_URL=$DATABASE_URL

# Expose port
EXPOSE 3000

# Start the locksmith service using workspace command with Railway deployment ID
CMD ["sh", "-c", "yarn workspace locksmith start --schema $RAILWAY_DEPLOYMENT_ID"]