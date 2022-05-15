import nodemailer from 'nodemailer'
import { route } from '../route'
import templates from '../templates'
import encrypter from '../encrypter'
import config from '../../config'

jest.mock('nodemailer')
jest.mock('../templates')
jest.mock('../encrypter')

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
      const transporter = {
        sendMail: jest.fn(() => {
          return Promise.resolve({ sent: true })
        }),
      }

      nodemailer.createTransport = jest.fn((params) => {
        expect(params).toEqual(config)
        return transporter
      })
    })

    it('should use the template with all the params', async () => {
      expect.assertions(4)
      templates.template = {
        subject: jest.fn(() => 'subject'),
        text: jest.fn(() => 'text'),
      }
      const args = {
        template: 'template',
        params: {
          hello: 'world',
          encryptedEmail: {
            value: 'email',
            encrypt: true,
          },
        },
        recipient: 'julien@unlock-protocol.com',
        attachments: ['data:text/plain;base64,aGVsbG8gd29ybGQ='],
      }

      encrypter.signParam = jest.fn((value) => {
        expect(value).toEqual(args.params.encryptedEmail.value)
        return 'encrypted!'
      })

      await route(args)
      expect(templates.template.subject).toHaveBeenCalledWith({
        encryptedEmail: 'encrypted!',
        hello: 'world',
      })
      expect(templates.template.text).toHaveBeenCalledWith({
        encryptedEmail: 'encrypted!',
        hello: 'world',
      })
    })

    it('should send the email using the transporter', async () => {
      expect.assertions(4)
      templates.template = {
        subject: jest.fn(() => 'subject'),
        text: jest.fn(() => 'text'),
      }

      const args = {
        template: 'template',
        params: { hello: 'world' },
        recipient: 'julien@unlock-protocol.com',
        attachments: ['data:text/plain;base64,aGVsbG8gd29ybGQ='],
      }

      const transporter = {
        sendMail: jest.fn((options) => {
          expect(options).toEqual({
            from: config.sender,
            html: undefined,
            subject: 'subject',
            text: 'text',
            to: args.recipient,
            attachments: ['data:text/plain;base64,aGVsbG8gd29ybGQ='],
          })
          return Promise.resolve({ sent: true })
        }),
      }
      nodemailer.createTransport = jest.fn((params) => {
        expect(params).toEqual(config)
        return transporter
      })

      await route(args)
      expect(templates.template.subject).toHaveBeenCalledWith(args.params)
      expect(templates.template.text).toHaveBeenCalledWith(args.params)
    })

    describe('when the email was sent succesfuly', () => {
      it('should yield its enveloppe', async () => {
        expect.assertions(2)
        templates.template = {
          subject: jest.fn(() => 'subject'),
          text: jest.fn(() => 'text'),
        }
        const args = {
          template: 'template',
          params: { hello: 'world' },
          recipient: 'julien@unlock-protocol.com',
        }
        const transporter = {
          sendMail: jest.fn(() => {
            return Promise.resolve({
              messageId: 'abc123',
            })
          }),
        }
        nodemailer.createTransport = jest.fn((params) => {
          expect(params).toEqual(config)
          return transporter
        })

        const result = await route(args)
        expect(result).toEqual({
          messageId: 'abc123',
        })
      })
    })

    describe('when the email was not sent succesfuly', () => {
      it('should yield the error message', async () => {
        expect.assertions(2)
        templates.template = {
          subject: jest.fn(() => 'subject'),
          text: jest.fn(() => 'text'),
        }
        const args = {
          template: 'template',
          params: { hello: 'world' },
          recipient: 'julien@unlock-protocol.com',
        }
        const transporter = {
          sendMail: jest.fn(() => {
            return Promise.reject(new Error('something went wrong'))
          }),
        }
        nodemailer.createTransport = jest.fn((params) => {
          expect(params).toEqual(config)
          return transporter
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
