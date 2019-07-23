import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved

namespace MetadataController {
  // eslint-disable-next-line import/prefer-default-export
  export const data = async (req: Request, res: Response): Promise<any> => {
    let defaultResponse = {
      name: 'Unlock Key',
      description: 'A Key to an Unlock lock.',
      image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
    }

    // Custom mappings
    // TODO: move that to a datastore at some point...
    if (
      req.params &&
      req.params.lockAddress.toLowerCase() ==
        '0x95de5F777A3e283bFf0c47374998E10D8A2183C7'.toLowerCase()
    ) {
      // Evan Van Ness's News letter
      defaultResponse.name = 'Unlock Key to Week in Ethereum News'
      defaultResponse.description = "A Key to the 'Week in Ethereum News' lock."
      defaultResponse.image =
        'https://assets.unlock-protocol.com/week-in-ethereum.png'
    }

    if (
      req.params &&
      req.params.lockAddress.toLowerCase() ==
        '0x75fA3Aa7E999B9899010C5f05E52cD0543dAb465'.toLowerCase()
    ) {
      // Forbes, 1 day
      defaultResponse.name = 'Forbes, ad-free, 1 day'
      defaultResponse.description =
        'A key to the Forbes ad-free experience, valid 1 day.'
      defaultResponse.image =
        'https://assets.unlock-protocol.com/forbes/forbes-1-day.png'
    }

    if (
      req.params &&
      req.params.lockAddress.toLowerCase() ==
        '0xb2B879764C649C7769f7c90845b0cb2A86add821'.toLowerCase()
    ) {
      // Forbes, 1 week
      defaultResponse.name = 'Forbes, ad-free, 1 week'
      defaultResponse.image =
        'https://assets.unlock-protocol.com/forbes/forbes-1-week.png'
      defaultResponse.description =
        'A key to the Forbes ad-free experience, valid 1 week.'
    }

    if (
      req.params &&
      req.params.lockAddress.toLowerCase() ==
        '0x98c0cbf0e9525f1a6975a51c9d5e8e063c034d6d'.toLowerCase()
    ) {
      //
      defaultResponse.name = 'Ticket for Berlin Open Source Salon 2019.'
      defaultResponse.image =
        'https://ipfs.bmann.ca/ipfs/QmNoDcxMV8CzUVkzQiLupYgZvpLQ9o1Q2xMEaLVTkk7WzQ'
      defaultResponse.description =
        'One ticket for the Berlin Open Source Salon 2019. https://berlin.opensourcesalon.com/'
    }

    // Append description
    defaultResponse.description = `${defaultResponse.description} Unlock is a protocol for memberships. https://unlock-protocol.com/`

    return res.json(defaultResponse)
  }
}

export = MetadataController
