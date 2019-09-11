---
title: Wordpress Plugin
subTitle: Adding a lock to your WordPress.org website has never been easier!
authorName: Julien Genestoux
publishDate: September 11, 2019
description: Wordpress.org is the most popular Content Management System. Adding a lock to your site let's you monetize the words you write without asking anyone's permission!
image: /static/images/blog/wordpress-plugin/wordpress.png
---

The world of publishing is [moving away from ads](https://medium.com/unlock-protocol/the-end-of-the-ad-supported-web-d4d093fb462f) as the single way to monetize content. In the last 18 months, most of the largest and most influential publications in the US and Europe have been moving to what they call "direct consumer revenue". This is a great thing because it changes incentives from trying steal their users' attention (click bait, fake news, endless slideshows... etc) to creating value for their members.

Unfortunately though, unless you're a very large publisher with your own engineering team to build and maintain your own paywall, it's nearly impossible to move to that model.

At Unlock, we believe that everyone one the web should be treated equally with the same capabilities. What is the point of democratizing publishing if only the biggest corporations can actually be paid for their work?

Today, we're introducing a [WordPress plugin for Unlock](https://github.com/unlock-protocol/unlock-wordpress-plugin) which lets you add a lock to your Wordpress.org site in minutes!

# Demo

First thing first: you can try it today on our [demo wordpress.org website](https://wordpress-demo.unlock-protocol.com/). This blog only has a single story, and some of the content on this page has been put behind a [lock](https://etherscan.io/address/0xb0114bbdce17e0af91b2be32916a1e236cf6034f): you will see a different version of it based on whether you are already a member or if you're not one.

![become member](/static/images/blog/wordpress-plugin/become-member-wordpress.png)
_If you're not a member you're invited to become one by clicking on a button_

# Installing on your own Wordpress

## Getting started

If you'd like to add a lock to your site, start by [deploying your first lock](https://unlock-protocol.com/blog/create-first-lock/).

While the lock is deploying you should install this plugin. Start by [downloading it](https://github.com/unlock-protocol/unlock-wordpress-plugin/archive/master.zip). Then, from the administration of your Wordpress.org website, in the `Plugins` section, click on the `Add New` button and then on the `Upload Plugin` button to upload the plugin.

![become member](/static/images/blog/wordpress-plugin/install-plugin.png)

Once installed, check the plugin's settings to add the address of the lock that you have deployed.

![become member](/static/images/blog/wordpress-plugin/plugin-settings.png)

## Writing locked stories

The plugin provides you with "Blocks" which can be used in the [Gutenberg Editor](https://wordpress.org/gutenberg/) (WordPress 5.0 and later), for both posts and pages. We provide 3 different blocks:

- The _locked_ block: a block whose content (rich text) is visible to non-members.
- The _unlocked_ block: a block whose content (rich text) is visible only to members.
- The _checkout button_ block: a block with a button to let you add a button for people to become members. This button will not be visible for members.

Once your story includes the content you need, you can preview its content like any other WordPress post or page. We recommend the use of a web3 wallet which supports multiple accounts so that you can easily toggle between accounts which are already members and accounts which are not members yet!

If you're using the WordPress plugin, we'd love to get your feedback and learn from you about ways it could be better! We're also working on several new additions for which we'd love to find early adopters, please get in touch!
