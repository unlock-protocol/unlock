# Wedlocks

Wedlocks is the email sending service for Unlock.

You can use it locally with:

```bash
netlify functions:serve
```

## API

There is a single API:

```bash
curl -X POST http://localhost:9999/.netlify/functions/emailer/ \
   -H 'Content-Type: application/json' \
   -d '{
    "template": "debug",
    "recipient": "julien@unlock-protocol.com",
    "params": {
        "foo": "bar"
    },
    "attachments":[]
}'
```

With the paywload sent as a JSON body. The payload needs to include the following:

- template
- recipient address
- params (key/values used in the template)

Check WedlockService in `unlock-app` for more details.

## Setup for Local Development

At the time of writing, Wedlocks requires the generation of a key pair to be utilized as part of the message encryption process.
The public key portion of the pair is expected to be utilized by the calling application.

The suggestion at this time is to utilize the code outlined [here](https://github.com/unlock-protocol/unlock/blob/master/wedlocks/src/__tests__/encrypter.test.js#L11).
This will be moved to a script
