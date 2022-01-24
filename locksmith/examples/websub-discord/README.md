# Websub Discord

This is an example application which receives events from locksmith websub endpoints and posts them to a Discord channel using webhook.

## Configure

Rename .template.env to .env file and fill all the keys with correct values.

You will need to create a hook for locksmith to receive events on your callback endpoint.

## Develop

1. Install all the dependencies.

```sh
yarn install 
```

2. Run `yarn dev` inside the project directory. This will automatically load the environment variables and kickstart the server.
