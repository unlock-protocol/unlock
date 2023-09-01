---
sidebar_position: 2
description: >-
  Learn how to configure the checkout process in order to collect members
  information.
---

import CodeBlock from '@theme/CodeBlock';

# Collecting Metadata

To achieve this, add a property called `metadataInputs` to your configuration object:

```text
{
  ...
  metadataInputs: [ /* input fields */ ],
  ...
}
```

The members of this array should have the following shape:

```bash
{
  name: string,
  type: 'text' | 'date' | 'color' | 'email' | 'url' | 'hidden',
  required: boolean,
  defaultValue?: 'string',
  value?: 'string',
  public?: true,
}
```

All fields are required except for `public`, which defaults to `false` and
`defaultValue`. Metadata is considered protected by default, so the only people
who can view it are the lock owner and the user associated with the metadata. If
any metadata should be visible to everyone, mark the `public` field as `true`.

If any input has `required: true`, it will render on the form with a red asterisk
next to it and the metadata form will not submit until it is filled appropriately.

Field names should be unique; if they are not then there may be collisions when
storing the data.

The `type` field maps to a certain subset of HTML `<input>` types, which
influences how the form renders. The following configuration results in a
checkout that looks like image below it.

The `value` attribute is only used if the `type` is `hidden`. The `hidden` type can
be used to attach specific user details to a user's membership NFT. As such it is
only really useful if the checkout config is built in a dynamic way.

```json

    "metadataInputs":[
       {
          "name":"First Name",
          "defaultValue":"",
          "type":"text",
          "required":false,
          "placeholder":"John Doe",
          "public":false
       },
       {
          "name":"Last Name",
          "defaultValue":"",
          "type":"text",
          "required":false,
          "placeholder":"Doe",
          "public":false
       },
       {
          "name":"Email",
          "defaultValue":"",
          "type":"email",
          "required":true,
          "placeholder":"john@doecorp.xyz",
          "public":false
       },
       {
          "name":"DOB",
          "defaultValue":"",
          "type":"date",
          "required":false,
          "placeholder":"",
          "public":false
       },
       {
          "name":"Favorite Color",
          "defaultValue":"",
          "type":"color",
          "required":false,
          "placeholder":"",
          "public":false
       },
       {
          "name":"Website",
          "defaultValue":"",
          "type":"url",
          "required":false,
          "placeholder":"https://example-url.com",
          "public":false
       }
    ]
```

<img alt="In this example, first and last names are required and all other fields are optional." class="half-width" src="/img/tools/checkout/collecting-metadata.gif" />

After the user fills out the form and clicks the "Continue" button, they will be prompted to sign a message so the data can be verified as coming from them. After they sign, the key purchase will initiate.

:::warning
If the user already has an active membership, they will not be prompted to
complete the metadata form!
:::
