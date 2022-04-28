import { Request, Response } from 'express'
import * as z from 'zod'
import crypto from 'crypto'
import { Application } from '../../models/application'
import { logger } from '../../logger'
import { createRandomToken } from '../../utils/auth'

export const ApplicationBody = z.object({
  name: z.string(),
  description: z.string().optional(),
})

export class ApplicationController {
  async listApplications(request: Request, response: Response) {
    try {
      const user = request.user!

      if (user.type === 'application') {
        return response
          .status(401)
          .send('Application cannot access details about other applications')
      }

      const applications = await Application.findAll({
        where: {
          walletAddress: user.walletAddress,
        },
      })
      // We don't want to provide secret on applications again
      const result = applications.map((app) => {
        return {
          ...app.toJSON(),
          secret: null,
        }
      })

      return response.status(200).json({
        result,
      })
    } catch (error) {
      logger.error(error.message)
      return response.status(500).json({
        message: 'Failed to fetch list of applications',
      })
    }
  }

  async createApplication(request: Request, response: Response) {
    try {
      const user = request.user!

      if (user.type === 'application') {
        return response.status(401).json({
          message: 'Application cannot create other application.',
        })
      }
      const { description, name } = await ApplicationBody.parseAsync(
        request.body
      )
      const application = new Application()

      application.name = name
      application.description = description
      application.walletAddress = user.walletAddress
      application.id = crypto.randomUUID()
      application.secret = createRandomToken()

      const applicationData = await application.save()

      return response.status(201).json(applicationData.toJSON())
    } catch (error) {
      logger.error(error.message)
      if (error instanceof z.ZodError) {
        return response.status(400).send({
          message: 'Application data schema is invalid',
          error: error.format(),
        })
      }
      return response.status(500).send({
        message: 'Application could not be created',
      })
    }
  }

  async deleteApplication(
    request: Request<{ id: string }>,
    response: Response
  ) {
    try {
      const user = request.user!
      const { id } = request.params

      if (user.type === 'application') {
        return response.status(401).json({
          message: 'Application cannot delete itself.',
        })
      }
      const application = await Application.findOne({
        where: {
          id,
          walletAddress: user.walletAddress,
        },
      })

      if (!application) {
        return response.status(404).json({
          message: 'Application not found or you do not have access to it.',
        })
      }

      await application.destroy()

      return response.status(200).json({
        message: 'Successfully deleted the application.',
      })
    } catch (error) {
      logger.error(error.message)
      return response.status(500).json({
        message: 'Application could not be deleted',
      })
    }
  }

  async regenerate(request: Request<{ id: string }>, response: Response) {
    try {
      const user = request.user!
      const { id } = request.params

      if (user.type === 'application') {
        return response.status(401).json({
          message: 'Application cannot generate its own API secret.',
        })
      }
      const application = await Application.findOne({
        where: {
          id,
          walletAddress: user.walletAddress,
        },
      })

      if (!application) {
        return response.status(404).json({
          message: 'Application not found.',
        })
      }

      application.secret = createRandomToken()
      const result = await application.save()
      return response.status(200).send(result.toJSON())
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'There was an error in regenerating the application secret',
      })
    }
  }

  async updateApplication(
    request: Request<{ id: string }>,
    response: Response
  ) {
    try {
      const user = request.user!
      const { id } = request.params
      if (user.type === 'application') {
        return response.status(401).json({
          message: 'Application cannot update itself.',
        })
      }
      const { name, description } = await ApplicationBody.parseAsync(
        request.body
      )

      const application = await Application.findOne({
        where: {
          id,
          walletAddress: user.walletAddress,
        },
      })

      if (!application) {
        return response.status(404).json({
          message: 'Application not found.',
        })
      }

      application.name = name
      application.description = description

      const app = await application.save()
      return response.status(200).json({
        ...app.toJSON(),
        secret: null,
      })
    } catch (error) {
      logger.error(error.message)
      if (error instanceof z.ZodError) {
        return response.status(400).send({
          message: 'Application data schema is invalid',
          error: error.format(),
        })
      }

      return response.status(500).send({
        message: 'Server error in updating the application',
      })
    }
  }
}
