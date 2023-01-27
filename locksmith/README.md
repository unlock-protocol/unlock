# Locksmith

Locksmith is a backend service that provides some services in the context of Unlock.
None of these services are required to use the core-protocol.
Among these services, locksmith provides the following:

- NFT metadata hosting
- membership metadata hosting
- Unlock accounts

The locksmith application has several entry points. By default it provides an API server, but could also be run for our `websub` worker. For the latter, prefix all commands with `websub:` (for example: `yarn run websub:dev`)

## Getting Started

### Configure Database

Locksmith uses postgres under the hood.

To start, you can spin up a local instance of postgres using docker by running `docker run --name locksmith-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -d postgres` or go with a traditional install or hosting provider.

Configure environment variables (Locksmith will recognize these placed in
an `.env.dev.local` file at the root of the monorepo)

If you used the docker command above, add:
`DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/locksmith` (you may need to replace the IP)

Alternatively, you could set these variables:

- `DB_USERNAME` - Database User
- `DB_PASSWORD` - Password of User
- `DB_NAME` - Database Name
- `DB_HOSTNAME` - Database Host

You will also need to add the following env var: `DEFAULT_NETWORK=1`

### Configure file storage

Locksmith uses S3 to store various files. To configure this, you will need to set the following environment variables:

- `STORAGE_ENDPOINT` - The endpoint for your S3 storage.
- `STORAGE_ACCESS_KEY_ID` - The access key for your S3 storage.
- `STORAGE_SECRET_ACCESS_KEY` - The secret access key for your S3 storage.
- `STORAGE_PUBLIC_HOST` - The host which is used to access the S3 storage. This is used to generate URLs for the files stored in S3. This will be a subdomain on your locksmith host such as `storage.host.com`

We use [cloudflare r2](https://developers.cloudflare.com/r2/get-started/) for our storage, but any S3 compatible storage should work.

## Running tests

Once the database has been configured (per above), make sure to migrate by calling `yarn run db:migrate` and then call `yarn run test:run`.

## Running Locksmith

For running in production, use `yarn start` otherwise `yarn dev` which will restart the server on file changes.

## Attributions

This product uses GeoLite2 data created by MaxMind, available from [https://www.maxmind.com](https://www.maxmind.com).
