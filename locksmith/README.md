# Locksmith

Locksmith provides the ability to store metadata associated with Locks outside
of the Ethereum blockchain, with reasonable permission around writes.

In the current iteration, reads are public and do not require authorization.

## Getting Started

### Running in Development

Locksmith utilizes SQLite to make it easy to get up and running. Upon startup
 the local database will be created and unprocessed migrations will be run.

You can start Locksmith in development with the following command: `npm run dev`.

### Running in Production

Locksmith's suggested production datastore is [Postgres](https://www.postgresql.org/),
and will require access to a running Instance. 

You can configure your connection details in a few ways. Here are the suggested methods:

1. Configure environment variables (Locksmith will recognize these placed in
 an .env file at the root of the application)
   * **DB_USERNAME** - Database User
   * **DB_PASSWORD** - Password of User
   * **DB_NAME** - Database Name
   * **DB_HOSTNAME** - Database Host

   __Note__: The following can be used to quickly get started setting up your __local development__ database.
   ```sql
   psql -c 'create database {DATABASE NAME};' -U postgres
   psql -c "create user {DATASBASE USER NAME} with password '{PASSWORD}';" -U postgres
   ```

2. If your configuration needs are more demanding than this, further configuration 
can be established by modifying the storage configuration file `config\config.js`.

Once configured, you will be able to start the application. `npm run dev` or `npm start`
will suffice depending on your needs for running Locksmith.

### Persistence Information

General database administration is out of scope for this document; it is generally
advised to provide the database user associated with the application with only the 
permissions required.

In development mode, migrations will run upon start up ensuring that your persistence 
layer is up to date. In production, migrations will need to be performed manually. This 
can be performed via `npm db:migrate`. Please review the migrations included so that you 
are aware of the items included.

### Testing

Tests can be run via `npm test`. Please note that the project includes end-to-end tests that
will require database access.