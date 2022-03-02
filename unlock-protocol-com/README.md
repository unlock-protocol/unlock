# Unlock Static Site

This sub-repository contains the static content pages for the Unlock project:

 * About
 * Jobs
 * Privacy Policy
 * Terms and Conditions
 * The Unlock Blog
 
## Requirements

This is a Node project that depends on React and NextJS. You must have Node and
npm installed to run.

Static pages use [NextJS](https://nextjs.org/) and as such contain two components:

 * A page file in `src/pages/` that displays the page
 * A React component in `src/components/` that contains page text
 
In addition, the blog contains markdown source files in `blog/` that are cached
as HTML components on launch.

## Getting Started

 1. Make sure you have installed required libraries by running `yarn`
 2. To launch the static site, run `yarn dev` at the command line while inside
    this sub-repository. This will both compile the NextJS source and the blog
    markdown files
