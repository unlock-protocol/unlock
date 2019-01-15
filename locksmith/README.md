# Locksmith

Locksmith provides the ability to store metadata associated with Locks outside
of the Ethereum blockchain, with reasonable permission around writes.

In the current iteration, reads are public and do not require authorization.

## Getting Started

### Running in Development

Locksmith utilizes SQLite to make it easy to get thing up and running. Upon startup
 the local database will be created and unprocessed migrations will be run.

You can start Locksmith in development with the following command: `npm run dev`.

### Running in Production

Locksmith's suggested production datastore is [Postgres](https://www.postgresql.org/), and will require access to a running Instance. 

You can configure your connection details in a few ways, here are the suggested methods:

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
can be established via the storage configuration file  `config\config.js`

Once configured, you will be able to start the application. `npm run dev` or `npm start` will suffice depending on your needs for running Locksmith

### Persistance Information

General database administration is out of scope for this document; it is generally
advised to provide the database user associated with the application with only the permissions required.

In development mode, migrations will run upon start up ensuring that your persistence layer is up to date. In production, migrations will need to be performed manually. This can be performed via `npm db:migrate`. Please review the migrations included so that you are aware of the items included.

### Testing

Test can be run via `npm test`. Please note that the project includes end to end tests that
will require database access.

## The Details

Locksmith's implementation is comprised of two components: an [Express middleware](https://expressjs.com/en/guide/using-middleware.html)
and an [Express](https://expressjs.com/) application. 

* The middleware manages the security concerns regarding the validity of a request based upon it's
 content and associated [JSON Web Token](#jwt-notes) (or `JWT` as it will be referred to going forward)..

*  The hosting application is effectively a standard CRUD application; managing the storage
 and update of Lock details.

This layered approach of handling authentication concerns prior to reaching the host application
 should provide confidence in our solution and aid in testing and development. 

### Endpoints

- Post **/lock** [Requires JWT] - Store details of Locks, new to the system
- Put **/lock/{lock address}** [Requires JWT] - Update details of Locks
- GET /**lock/{lock address}** - Retrieve details of the requested Lock

### JWT Notes

An introduction to [JSON Web Tokens](https://jwt.io/introduction/) can be located here and is definitely worth a read.
 Locksmith assumes that request to modify storage will be accompanied by a JWT that has been signed by the owner of the entity requesting to be updated.

#### Header

The header of the must include `"typ": "JWT"`, the `alg` component should also be included -  a
 specific value isnt required but may be updated in the future to indicate signing with Ethereum's ECDSA
  or higher order class of signing algorithms.

#### Payload

The payload is expected to be JSON and include the following claims:

* `iss` - Issuer (Ethereum address of the entity owner)
* `iat` - Issued At Time
* `exp` - Expiration Time 

#### Signature

The Signature is expected to be `header.payload` signed with the owner's private key. This is a fairly 
standard approach to generating an Asymmetriclly signed JWT
