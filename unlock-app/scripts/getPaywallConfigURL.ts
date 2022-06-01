const paywallConfig = {
  title: 'Bakery.fyi',
  locks: {
    '0x81aFDE0689618071CaCDBa5F8Bc46ea160f75265': {
      name: 'Basic',
      network: 4,
    },
    '0x582eCeFA60c350d82EAf169df0035f3DDaCC795D': {
      name: 'Premium',
      network: 4,
    },
    '0xCE62D71c768aeD7EA034c72a1bc4CF58830D9894': {
      network: 100,
      name: 'Outer world',
    },
  },
  icon: 'https://i.ibb.co/sQkJxhb/Ellipse-56.png',
  callToAction: {},
  metadataInputs: [
    {
      name: 'Email',
      type: 'email',
      required: true,
      public: false,
    },
    {
      name: 'Name',
      type: 'text',
      required: true,
    },
  ],
  pessimistic: true,
}

console.log(
  `http://localhost:3000/alpha/checkout?paywallConfig=${encodeURI(
    JSON.stringify(paywallConfig)
  )}`
)
