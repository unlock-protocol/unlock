## Nudge

Nudge is service, designed to email token holders when their key purchase transactions have been successfully mined.

### How does it work?

The service fetches newly minted tokens from a GraphQL monitoring service. 
Upon finding new tokens, the service will check to see if it has already been processed and if not if an email 
address has been attached.  In its current implementation, Nudge will look for the owner metadata associated with the key purchase. The values of the `protected.emailAddress` field (if applicable), will be used to send [an email confirming the key purchase](https://github.com/unlock-protocol/unlock/blob/master/wedlocks/src/templates/keyMined.js).

Under these conditions an email will be dispatched and upon successful dispatch will be recorded as so in order to avoid "duplicate" emails.

### Considerations

The service was designed to be fairly simple, reflecting the current usage of the ecosystem. If the demand increases, 
the request for data processing should be queued with the requisite paralellization being provided via workers.

### Running the application

Nudge includes a Dockerfile, it is the easiest way to run the application. The following ENV variables need to be passed to the container:

* DB_USERNAME
* DB_PASSWORD
* DB_NAME
* DB_HOSTNAME
* WEB3_PROVIDER_HOST
* WEDLOCKS_URI
* GRAPHQL_BASE_URL
