# Wedlocks

Wedlocks is the email sending service for Unlock.
This is intended to be deployed as an AWS lambda function (or similar).
For that purpose we use webpack to build a single js file.

For local dev, we have a local server running which "mimicks" requests sent to lambda.

## API

There is a single API:

```
POST http://localhost:1337
```

```bash
curl -X POST  http://127.0.0.1:1337/ \
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
