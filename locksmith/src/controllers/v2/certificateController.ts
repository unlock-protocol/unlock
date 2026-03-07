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

  const certificate = await createCertificate({
    lockAddress,
    tokenId,
    network,
  })

  if (!certificate) {
    response.status(422).send({
      message: `Certificate can't be generated for the provided tokenId`,
    })
    return
  }

  response.writeHead(200, {
    'Content-Type': 'image/svg+xml',
    'Content-Length': certificate.length,
  })

  response.end(certificate)
  return
}
