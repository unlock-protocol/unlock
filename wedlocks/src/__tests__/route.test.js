import { it, beforeEach, describe, expect, vi } from 'vitest'

import { route } from '../route'
import config from '../../config'
import emailService from '../emailService'
import templates from '@unlock-protocol/email-templates'

vi.mock('../emailService')
vi.mock('../encrypter')

describe('route', () => {
  describe('when there is no matching template', () => {
    it('should yield an error', async () => {
      expect.assertions(1)

      try {
        await route({ template: 'notATemplate' })
      } catch (e) {
        expect(e.message).toEqual('Missing template')
      }
    })
  })

  describe('when there is a matching template', () => {
    beforeEach(() => {
      emailService.send.mockClear()
    })

    it('should use the template with all the params', async () => {
      expect.assertions(2)
      expect.assertions(2)
      templates.template = {
        subject: async () => 'subject',
        text: async () => 'text',
      }
      const args = {
        template: 'template',
        params: {
          hello: 'world',
        },
        recipient: 'julien@unlock-protocol.com',
        attachments: ['data:text/plain;base64,aGVsbG8gd29ybGQ='],
      }

      await route(args)

      expect(emailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'subject',
          text: 'text',
        })
      )
    })

    it('should send the email using the email service', async () => {
      expect.assertions(1)
      templates.template = {
        subject: async () => 'subject',
        text: async () => 'text',
      }

      const args = {
        template: 'template',
        params: { hello: 'world' },
        recipient: 'julien@unlock-protocol.com',
        attachments: ['data:text/plain;base64,aGVsbG8gd29ybGQ='],
      }

      emailService.send.mockImplementationOnce((options) => {
        expect(options).toEqual({
          from: { name: 'Unlock Labs', email: `hello@unlock-protocol.com` },
          to: { email: args.recipient },
          replyTo: undefined,
          subject: 'subject',
          html: undefined,
          text: 'text',
          attachments: ['data:text/plain;base64,aGVsbG8gd29ybGQ='],
        })
        return Promise.resolve({ messageId: 'abc123' })
      })

      await route(args)
    })

    it('should send the email using the email service with custom sender', async () => {
      expect.assertions(1)
      templates.template = {
        subject: async () => 'subject',
        text: async () => 'text',
      }

      const args = {
        template: 'template',
        params: { hello: 'world' },
        recipient: 'julien@unlock-protocol.com',
        attachments: ['data:text/plain;base64,aGVsbG8gd29ybGQ='],
        emailSender: 'Custom Sender',
      }

      emailService.send.mockImplementationOnce((options) => {
        expect(options).toEqual({
          from: { name: 'Custom Sender', email: 'hello@unlock-protocol.com' },
          to: { email: args.recipient },
          replyTo: undefined,
          subject: 'subject',
          html: undefined,
          text: 'text',
          attachments: ['data:text/plain;base64,aGVsbG8gd29ybGQ='],
        })
        return Promise.resolve({ messageId: 'abc123' })
      })

      await route(args)
    })

    describe('when the email was sent succesfuly', () => {
      it('should yield its enveloppe', async () => {
        expect.assertions(1)
        templates.template = {
          subject: async () => 'subject',
          text: async () => 'text',
        }
        const args = {
          template: 'template',
          params: { hello: 'world' },
          recipient: 'julien@unlock-protocol.com',
        }

        emailService.send.mockImplementationOnce(() => {
          return Promise.resolve({
            messageId: 'abc123',
          })
        })

        const result = await route(args)
        expect(result).toEqual({
          messageId: 'abc123',
        })
      })
    })

    describe('when the email was not sent successfully', () => {
      it('should yield the error message', async () => {
        expect.assertions(1)
        templates.template = {
          subject: async () => 'subject',
          text: async () => 'text',
        }
        const args = {
          template: 'template',
          params: { hello: 'world' },
          recipient: 'julien@unlock-protocol.com',
        }

        emailService.send.mockImplementationOnce(() => {
          return Promise.reject(new Error('something went wrong'))
        })

        try {
          await route(args)
        } catch (e) {
          expect(e.message).toEqual('something went wrong')
        }
      })
    })
  })
})
