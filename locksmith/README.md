# Locksmith

Locksmith is a backend service that prvovides some services in the context of Unlock.
None of these services are required to use the core-protocol.
Among these services, locksmith provides the following:

- NFT metadata hosting
- membership metadata hosting
- Unlock accounts

## Getting Started

### Configure Database

Locksmith uses postgres under the hood.

You can spin up a local instance of postgres using docker by running `docker run --name locksmith-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -d postgres` or go with a traditional install or hosting provider.

1. Configure environment variables (Locksmith will recognize these placed in
   an `.env.dev.local` file at the root of the monorepo)

   - **DB_USERNAME** - Database User
   - **DB_PASSWORD** - Password of User
   - **DB_NAME** - Database Name
   - **DB_HOSTNAME** - Database Host

   **Note**: The following can be used to quickly get started setting up your **local development** database.

   ```sql
   psql -c 'create database {DATABASE NAME};' -U postgres
   psql -c "create user {DATASBASE USER NAME} with password '{PASSWORD}';" -U postgres
   ```

### Running Locksmith

For running in production, use `yarn start` otherwise `yarn dev` which will restart the server on file changes.

### Persistence Information

General database administration is out of scope for this document; it is generally
advised to provide the database user associated with the application with only the
permissions required.

In development mode, migrations will run upon start up ensuring that your persistence
layer is up to date. In production, migrations will need to be performed manually. This
can be performed via `yarn db:migrate`. Please review the migrations included so that you
are aware of the items included.

### Testing

Tests can be run via `yarn test`. Please note that the project includes end-to-end tests that
will require database access
