import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved

namespace MetadataController {
  // eslint-disable-next-line import/prefer-default-export
  export const data = async (req: Request, res: Response): Promise<any> => {
    let defaultResponse = {
      description:
        'A Key to an Unlock lock. Unlock protocol for memberships. https://unlock-protocol.com/',
      image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
      name: 'Unlock Key',
    }

    // Custom mappings
    // TODO: move that to a datastore at some point...
    if (
      req.params &&
      req.params.lockAddress.toLowerCase() ==
        '0x95de5F777A3e283bFf0c47374998E10D8A2183C7'.toLowerCase()
    ) {
      // Evan Van Ness's News letter
      defaultResponse.description =
        "A Key to the 'Week in Ethereum News' lock. Unlock protocol for memberships. https://unlock-protocol.com/"
      defaultResponse.image =
        'https://assets.unlock-protocol.com/unlock-default-key-image.png'
      defaultResponse.name = 'Unlock Key to Week in Ethereum News'
    }

    return res.json(defaultResponse)
  }
}

export = MetadataController
