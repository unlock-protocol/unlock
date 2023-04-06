import { SubgraphService } from '@unlock-protocol/unlock-js'
import { Request, RequestHandler, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import { createCertificate } from '../../utils/certification'

export const generateCertificate: RequestHandler = async (
  request: Request,
  response: Response
) => {
  const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
  const network = Number(request.params.network)
  const tokenId = request.params.keyId.toLowerCase()
  const subgraph = new SubgraphService()
  const key = await subgraph.key(
    {
      where: {
        tokenId,
        lock_in: [lockAddress.toLowerCase()],
      },
    },
    {
      network,
    }
  )

  if (!key) {
    return response.status(404).send({
      message: 'Key not found',
    })
  }

  const certificate = await createCertificate({
    lockAddress,
    tokenId,
    network,
    key,
  })

  response.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Content-Length': certificate.length,
  })

  return response.end(certificate)
}
