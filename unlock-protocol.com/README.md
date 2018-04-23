# gatsby-starter-default
The default Gatsby starter.

For an overview of the project structure please refer to the [Gatsby documentation - Building with Components](https://www.gatsbyjs.org/docs/building-with-components/).

## Install

Make sure that you have the Gatsby CLI program installed:
```sh
npm install --global gatsby-cli
```

And run from your CLI:
```sh
gatsby new gatsby-example-site
```

Then you can run it by:
```sh
cd gatsby-example-site
npm run develop
```

## Deploy

1. Build with `npm run build`: this will put the static site into `public`
2. Deploy with [s3_website](https://github.com/laurilehmijoki/s3_website). Check config in `s3_website.yml`. You need s3 credentials stored in `~/.aws/credentials`.