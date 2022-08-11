const paywallConfig = {
  title: 'Bakery.fyi',
  locks: {
    '0x0933f78b651BDF37511f6905d7e8B134d5b7e358': {
      name: 'Basic',
      network: 5,
    },
    '0x582eCeFA60c350d82EAf169df0035f3DDaCC795D': {
      name: 'Premium',
      network: 4,
    },
    '0xCE62D71c768aeD7EA034c72a1bc4CF58830D9894': {
      network: 100,
      default: true,
      name: 'Outer world',
    },
  },
  icon: 'https://i.ibb.co/sQkJxhb/Ellipse-56.png',
  callToAction: {},
  pessimistic: true,
  metadataInputs: [
    {
      type: 'email',
      name: 'Email',
      required: true,
      public: true,
    },
  ],
  captcha: true,
}

console.log(
  `http://localhost:3000/alpha/checkout?paywallConfig=${encodeURI(
    JSON.stringify(paywallConfig)
  )}`
)
