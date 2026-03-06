import { Request, Response } from 'express'
import { Attestation } from '../../models/attestation'
import * as z from 'zod'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import { sendEmail } from '../../operations/wedlocksOperations'
import { getLockMetadata } from '../../operations/metadataOperations'
import { createAttestationCertificate } from '../../utils/attestationCertificate'
import { svgStringToPdfURI } from '../../utils/pdf'

export const AttestationBody = z.object({
  tokenId: z.string(),
  schemaId: z.string(),
  attestationId: z.string(),
  txHash: z.string().optional(),
  data: z.record(z.any()),
  recipient: z.string().email().optional(),
})

export type AttestationBodyProps = z.infer<typeof AttestationBody>

export class AttestationController {
  // Create a new attestation record
  async createAttestation(request: Request, response: Response) {
    const network = Number(request.params.network)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)

    try {
      const { recipient, ...props } = await AttestationBody.parseAsync(
        request.body
      )

      const [attestation, created] = await Attestation.upsert(
        {
          lockAddress,
          network,
          ...props,
          tokenId: Normalizer.ethereumAddress(props.tokenId),
        },
        {
          conflictFields: ['attestationId'],
          returning: true,
        }
      )

      // Send certificate email if recipient is provided
      if (recipient) {
        try {
          await this.sendAttestationEmail({
            recipient,
            lockAddress,
            network,
            attestationId: props.attestationId,
            tokenId: props.tokenId,
            data: props.data,
          })
          logger.info(`Attestation certificate email sent to ${recipient}`)
        } catch (emailError: any) {
          // Log but don't fail the request if email fails
          logger.error(
            `Failed to send attestation email: ${emailError.message}`
          )
        }
      }

      response.status(created ? 201 : 200).json(attestation)
      return
    } catch (err: any) {
      logger.error(err.message)
      response.status(500).json({
        message: 'Failed to save attestation.',
      })
      return
    }
  }

  // Send attestation certificate email
  private async sendAttestationEmail({
    recipient,
    lockAddress,
    network,
    attestationId,
    tokenId,
    data,
  }: {
    recipient: string
    lockAddress: string
    network: number
    attestationId: string
    tokenId: string
    data: Record<string, any>
  }) {
    // Get lock metadata for certificate generation
    const lockMetadata = await getLockMetadata({ lockAddress, network })
    const lockName = lockMetadata?.name || 'Certification'

    // Generate the certificate SVG with attestation data
    const certificateSvg = await createAttestationCertificate({
      network,
      lockAddress,
      tokenId,
      attestationId,
      attestationData: data,
      lockMetadata,
    })

    // Convert SVG to PDF for email attachment
    const attachments = []
    if (certificateSvg) {
      const pdfDataUri = await svgStringToPdfURI(certificateSvg)
      attachments.push({
        path: pdfDataUri,
        filename: 'attestation-certificate.pdf',
      })
    }

    // Send the email
    await sendEmail({
      network,
      template: 'attestationCreated',
      failoverTemplate: 'certificationKeyMined',
      recipient,
      params: {
        lockAddress,
        lockName,
        network: network.toString(),
        attestationId,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      attachments,
    })
  }

  // Get a single attestation by attestationId
  async getAttestation(request: Request, response: Response) {
    const network = Number(request.params.network)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const attestationId = request.params.attestationId

    try {
      const attestation = await Attestation.findOne({
        where: {
          lockAddress,
          network,
          attestationId,
        },
      })

      if (!attestation) {
        response.status(404).json({
          message: 'Attestation not found.',
        })
        return
      }

      response.status(200).json(attestation)
      return
    } catch (err: any) {
      logger.error(err.message)
      response.status(500).json({
        message: 'Failed to retrieve attestation.',
      })
      return
    }
  }

  // Get all attestations for a lock
  async listAttestations(request: Request, response: Response) {
    const network = Number(request.params.network)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)

    try {
      const attestations = await Attestation.findAll({
        where: {
          lockAddress,
          network,
        },
        order: [['createdAt', 'DESC']],
      })

      response.status(200).json(attestations)
      return
    } catch (err: any) {
      logger.error(err.message)
      response.status(500).json({
        message: 'Failed to retrieve attestations.',
      })
      return
    }
  }

  // Get attestations by tokenId
  async getAttestationsByTokenId(request: Request, response: Response) {
    const network = Number(request.params.network)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const tokenId = request.params.tokenId

    try {
      const attestations = await Attestation.findAll({
        where: {
          lockAddress,
          network,
          tokenId,
        },
        order: [['createdAt', 'DESC']],
      })

      response.status(200).json(attestations)
      return
    } catch (err: any) {
      logger.error(err.message)
      response.status(500).json({
        message: 'Failed to retrieve attestations.',
      })
      return
    }
  }

  // Get attestations for the authenticated user (by their wallet address)
  async getMyAttestations(request: Request, response: Response) {
    const network = Number(request.params.network)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const userAddress = Normalizer.ethereumAddress(request.user!.walletAddress)

    try {
      const attestations = await Attestation.findAll({
        where: {
          lockAddress,
          network,
          tokenId: userAddress,
        },
        order: [['createdAt', 'DESC']],
      })

      response.status(200).json(attestations)
      return
    } catch (err: any) {
      logger.error(err.message)
      response.status(500).json({
        message: 'Failed to retrieve attestations.',
      })
      return
    }
  }

  // Download attestation certificate as PDF
  async downloadAttestationCertificate(request: Request, response: Response) {
    const network = Number(request.params.network)
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const attestationId = request.params.attestationId
    const userAddress = Normalizer.ethereumAddress(request.user!.walletAddress)

    try {
      const attestation = await Attestation.findOne({
        where: {
          lockAddress,
          network,
          attestationId,
        },
      })

      if (!attestation) {
        response.status(404).json({
          message: 'Attestation not found.',
        })
        return
      }

      // Verify the authenticated user matches the attestation tokenId
      const attestationTokenId = Normalizer.ethereumAddress(attestation.tokenId)
      if (attestationTokenId !== userAddress) {
        response.status(403).json({
          message: 'You are not authorized to download this attestation.',
        })
        return
      }

      // Get lock metadata for certificate generation
      const lockMetadata = await getLockMetadata({ lockAddress, network })

      // Generate the certificate SVG
      const certificateSvg = await createAttestationCertificate({
        network,
        lockAddress,
        tokenId: attestation.tokenId,
        attestationId: attestation.attestationId,
        attestationData: attestation.data as Record<string, any>,
        lockMetadata,
      })

      if (!certificateSvg) {
        response.status(500).json({
          message: 'Failed to generate certificate.',
        })
        return
      }

      // Convert SVG to PDF
      const pdfDataUri = await svgStringToPdfURI(certificateSvg)

      // Extract base64 data from data URI
      const base64Data = pdfDataUri.replace('data:application/pdf;base64,', '')
      const pdfBuffer = Buffer.from(base64Data, 'base64')

      // Set response headers for PDF download
      const data = attestation.data as Record<string, any>
      const filename =
        `attestation-${data.firstName || ''}-${data.lastName || ''}.pdf`
          .replace(/\s+/g, '-')
          .toLowerCase()

      response.setHeader('Content-Type', 'application/pdf')
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      )
      response.send(pdfBuffer)
      return
    } catch (err: any) {
      logger.error(err.message)
      response.status(500).json({
        message: 'Failed to download attestation certificate.',
      })
      return
    }
  }
}
