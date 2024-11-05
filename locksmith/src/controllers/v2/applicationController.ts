import { Request, Response } from 'express'
import * as z from 'zod'
import crypto from 'crypto'
import { Application } from '../../models/application'
import { logger } from '../../logger'

export const ApplicationBody = z.object({
  name: z.string(),
})

export class ApplicationController {
  async listApplications(request: Request, response: Response) {
    try {
      const user = request.user!
      const applications = await Application.findAll({
        where: {
          walletAddress: user.walletAddress,
        },
      })
      // We don't want to provide API KEY again
      const result = applications.map((app) => {
        return {
          ...app.toJSON(),
          key: null,
        }
      })

      response.status(200).json({
        result,
      })
      return
    } catch (error) {
      logger.error(error.message)
      response.status(500).json({
        message: 'Failed to fetch list of applications',
      })
      return
    }
  }

  async createApplication(request: Request, response: Response) {
    try {
      const user = request.user!
      const { name } = await ApplicationBody.parseAsync(request.body)
      const application = new Application()

      application.name = name
      application.walletAddress = user.walletAddress
      application.key = Buffer.from(crypto.randomUUID()).toString('base64')

      const applicationData = await application.save()

      response.status(201).json(applicationData.toJSON())
      return
    } catch (error) {
      logger.error(error.message)
      if (error instanceof z.ZodError) {
        response.status(400).send({
          message: 'Application data schema is invalid',
          error: error.format(),
        })
        return
      }
      response.status(500).send({
        message: 'Application could not be created',
      })
      return
    }
  }

  async deleteApplication(
    request: Request<{ id: string }>,
    response: Response
  ) {
    try {
      const user = request.user!
      const id = Number(request.params.id)
      const application = await Application.findOne({
        where: {
          id,
          walletAddress: user.walletAddress,
        },
      })

      if (!application) {
        response.status(404).json({
          message: 'Application not found or you do not have access to it.',
        })
        return
      }

      await application.destroy()

      response.status(200).json({
        message: 'Successfully deleted the application.',
      })
      return
    } catch (error) {
      logger.error(error.message)
      response.status(500).json({
        message: 'Application could not be deleted',
      })
      return
    }
  }

  async updateApplication(
    request: Request<{ id: string }>,
    response: Response
  ) {
    try {
      const user = request.user!
      const id = Number(request.params.id)
      const { name } = await ApplicationBody.parseAsync(request.body)

      const application = await Application.findOne({
        where: {
          id,
          walletAddress: user.walletAddress,
        },
      })

      if (!application) {
        response.status(404).json({
          message: 'Application not found.',
        })
        return
      }

      application.name = name

      const app = await application.save()
      response.status(200).json({
        ...app.toJSON(),
        key: null,
      })
      return
    } catch (error) {
      logger.error(error.message)
      if (error instanceof z.ZodError) {
        response.status(400).send({
          message: 'Application data schema is invalid',
          error: error.format(),
        })
        return
      }
      response.status(500).send({
        message: 'Server error in updating the application',
      })
      return
    }
  }
}
