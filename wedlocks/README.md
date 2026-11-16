# Wedlocks

Wedlocks is the email sending service for Unlock.

You can use it locally with:

```bash
yarn dev
```

## API

There is a single API:

```bash
curl -X POST http://localhost:9999/ \
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

You can also preview emails in a web browser by going to:

```
http://localhost:9999/preview/<template>?<foo>=<bar>
```

Where `<template>` is the template to use and `<foo>` are properties and `<bar>` are values in the template.

With the payload sent as a JSON body. The payload needs to include the following:

- template
- recipient address
- params (key/values used in the template)

Check WedlockService in `unlock-app` for more details.

## Staging

Staging sets `DELIVERY_DISABLED = "true"` in `wrangler.toml`: requests are validated and rendered, then dropped before SMTP. Nothing is sent (or billed). Use `/preview/<template>` to check emails on staging.
