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
  },
  icon: 'https://cdn-icons-png.flaticon.com/512/1669/1669110.png',
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
  `http://localhost:3000/checkout?paywallConfig=${encodeURI(
    JSON.stringify(paywallConfig)
  )}`
)
