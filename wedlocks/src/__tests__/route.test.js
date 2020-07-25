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
    it('should yield an error', (done) => {
      expect.assertions(2)
      route({ template: 'notATemplate' }, (error, info) => {
        expect(info).toBe(undefined)
        expect(error.message).toBe('Missing template')
        done()
      })
    })
  })

  describe('when there is a matching template', () => {
    beforeEach(() => {
      const transporter = {
        sendMail: jest.fn((options, callback) => {
          return callback()
        }),
      }

      nodemailer.createTransport = jest.fn((params) => {
        expect(params).toEqual(config)
        return transporter
      })
    })

    it('should use the template with all the params', (done) => {
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

      route(args, () => {
        expect(templates.template.subject).toHaveBeenCalledWith({
          encryptedEmail: 'encrypted!',
          hello: 'world',
        })
        expect(templates.template.text).toHaveBeenCalledWith({
          encryptedEmail: 'encrypted!',
          hello: 'world',
        })
        done()
      })
    })

    it('should send the email using the transporter', (done) => {
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
        sendMail: jest.fn((options, callback) => {
          expect(options).toEqual({
            from: config.sender,
            html: null,
            subject: 'subject',
            text: 'text',
            to: args.recipient,
            attachments: ['data:text/plain;base64,aGVsbG8gd29ybGQ='],
          })
          return callback()
        }),
      }
      nodemailer.createTransport = jest.fn((params) => {
        expect(params).toEqual(config)
        return transporter
      })

      route(args, () => {
        expect(templates.template.subject).toHaveBeenCalledWith(args.params)
        expect(templates.template.text).toHaveBeenCalledWith(args.params)
        done()
      })
    })

    describe('when the email was sent succesfuly', () => {
      it('should yield its enveloppe', (done) => {
        expect.assertions(3)
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
          sendMail: jest.fn((options, callback) => {
            return callback(null, {
              messageId: 'abc123',
            })
          }),
        }
        nodemailer.createTransport = jest.fn((params) => {
          expect(params).toEqual(config)
          return transporter
        })

        route(args, (error, result) => {
          expect(error).toBe(null)
          expect(result).toEqual({
            messageId: 'abc123',
          })
          done()
        })
      })
    })

    describe('when the email was not sent succesfuly', () => {
      it('should yield the error message', (done) => {
        expect.assertions(3)
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
          sendMail: jest.fn((options, callback) => {
            return callback(new Error('something went wrong'))
          }),
        }
        nodemailer.createTransport = jest.fn((params) => {
          expect(params).toEqual(config)
          return transporter
        })

        route(args, (error, result) => {
          expect(result).toBe(undefined)
          expect(error.message).toBe('something went wrong')
          done()
        })
      })
    })
  })
})
