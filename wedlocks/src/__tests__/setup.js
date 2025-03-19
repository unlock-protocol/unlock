import { vi } from 'vitest'

/**
 * Test setup file that defines all mocks needed for wedlocks tests
 *
 * This centralizes all mocking in one place instead of using separate mock files
 */

// Mock for cloudflare:sockets - required by worker-mailer
// This is a virtual module that doesn't exist during tests
vi.mock(
  'cloudflare:sockets',
  () => ({
    default: {
      connect: vi.fn(),
      Socket: vi.fn(),
    },
  }),
  { virtual: true }
)

// Mock for worker-mailer
vi.mock('worker-mailer', () => ({
  WorkerMailer: {
    connect: vi.fn(() => ({
      send: vi.fn((emailData) =>
        Promise.resolve({ messageId: 'mocked-message-id' })
      ),
    })),
  },
}))

// Mock for @unlock-protocol/email-templates
vi.mock('@unlock-protocol/email-templates', () => {
  const mockTemplates = {
    template: {
      subject: 'subject',
      text: 'text',
      html: '<p>test</p>',
    },
  }

  return {
    default: mockTemplates,
    PrecompiledTemplates: {
      template: {
        subject: {},
        text: {},
        html: {},
      },
      bases: {
        defaultBase: {},
      },
    },
  }
})

// Mock templateRenderer
vi.mock('../templateRenderer', () => ({
  templateRenderer: {
    renderSubject: vi.fn(() => 'subject'),
    renderText: vi.fn(() => 'text'),
    renderHtml: vi.fn(() => undefined),
    validateTemplateExists: vi.fn((templateName) => {
      if (templateName === 'notATemplate') {
        throw new Error('Missing template')
      }
    }),
  },
}))

// Mock emailService
vi.mock('../emailService', () => ({
  emailService: {
    send: vi.fn((emailData) =>
      Promise.resolve({ messageId: 'mocked-message-id' })
    ),
  },
  default: {
    send: vi.fn((emailData) =>
      Promise.resolve({ messageId: 'mocked-message-id' })
    ),
  },
}))
