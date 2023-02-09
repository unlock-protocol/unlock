import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { storage } from '~/config/storage'
import { DefaultEditor } from 'react-simple-wysiwyg'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface EmailTemplatePreviewProps {
  header?: string
  footer?: string
  template: string
  disabled: boolean
  network: number
  lockAddress: string
}

export const EmailTemplatePreview = ({
  header,
  footer,
  template,
  disabled,
  network,
  lockAddress,
}: EmailTemplatePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false)
  const [customContent, setCustomContent] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>()

  const onSubmit = () => {}

  const onSaveCustomContent = async () => {
    const saveEmailPromise = storage.saveCustomEmailContent(
      network,
      lockAddress,
      template,
      {
        data: {
          content: customContent,
        },
      }
    )
    await ToastHelper.promise(saveEmailPromise, {
      loading: 'Updating custom email content...',
      error: 'Could not update custom email content.',
      success: 'Custom email content updated.',
    })
  }

  const saveCustomContent = useMutation(onSaveCustomContent)

  useQuery(
    ['getCustomContent', network, lockAddress, template],
    async () => {
      const res = await storage.getCustomEmailContent(
        network,
        lockAddress,
        template
      )
      return res?.data?.content || ''
    },
    {
      onSuccess: (content: any) => {
        setCustomContent(content || '')
      },
      enabled: !disabled,
    }
  )

  const loading = saveCustomContent.isLoading

  return (
    <>
      <style jsx global>
        {`
          @media only screen and (max-width: 620px) {
            table.body h1 {
              font-size: 36px !important;
              line-height: 40px;
              margin-bottom: 12px !important;
            }

            table.body p,
            table.body ul,
            table.body ol,
            table.body td,
            table.body span,
            table.body a {
              font-size: 16px !important;
            }

            table.body .wrapper,
            table.body .article {
              padding: 10px !important;
            }

            table.body .content {
              padding: 0 !important;
            }

            table.body .container {
              padding: 0 !important;
              width: 100% !important;
            }

            table.body .main {
              border-left-width: 0 !important;
              border-radius: 0 !important;
              border-right-width: 0 !important;
            }

            table.body .btn table {
              width: 100% !important;
            }

            table.body .btn a {
              width: 100% !important;
            }

            table.body .img-responsive {
              height: auto !important;
              max-width: 100% !important;
              width: auto !important;
            }
          }
          @media all {
            .ExternalClass {
              width: 100%;
            }

            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
              line-height: 100%;
            }

            .apple-link a {
              color: inherit !important;
              font-family: inherit !important;
              font-size: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
              text-decoration: none !important;
            }

            #MessageViewBody a {
              color: inherit;
              text-decoration: none;
              font-size: inherit;
              font-family: inherit;
              font-weight: inherit;
              line-height: inherit;
            }

            .btn-primary table td:hover {
              background-color: #603deb !important;
            }

            .btn-primary a:hover {
              background-color: #bfb1f7 !important;
              border-color: #bfb1f7 !important;
            }
          }
          p,
          ul,
          ol,
          li {
            font-family: sans-serif;
            font-size: 18px;
            font-weight: normal;
          }

          body: {
            font-family: sans-serif;
            font-size: 18px;
            font-weight: normal;
            margin: 0;
            margin-bottom: 16px;
          }
          h1 {
            font-family: sans-serif;
            font-size: 28px;
            line-height: 40px;
            font-weight: bold;
            margin: 0;
            margin-bottom: 16px;
          }
          code {
            border-radius: 0.375rem;
            font-weight: 500;
            border-style: solid;
            border-width: 1px;
            border-color: rgb(203 213 225);
            background-color: rgb(241 245 249);
            padding: 0.125rem 0.25rem;
          }
        `}
      </style>
      <div className="flex flex-col justify-start gap-3">
        <DefaultEditor
          value={customContent}
          onChange={(e) => setCustomContent(e.target.value)}
        />
        <div className="flex gap-2 ml-auto">
          <Button
            size="small"
            onClick={() => saveCustomContent.mutateAsync()}
            loading={loading}
            disabled={loading}
          >
            Save custom content
          </Button>
          <Button
            size="small"
            variant="outlined-primary"
            onClick={() => setShowPreview(!showPreview)}
            disabled={loading}
          >
            Show preview
          </Button>
        </div>
        {showPreview && (
          <Modal isOpen={showPreview} setIsOpen={setShowPreview}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col w-full gap-6 py-4"
            >
              <table
                role="presentation"
                border={0}
                cellPadding={0}
                cellSpacing={0}
                className="body"
                style={{
                  borderCollapse: 'separate',
                  backgroundColor: '#fffaf1',
                  width: '100%',
                }}
                width="100%"
                bgcolor="#FFFAF1"
              >
                <tbody>
                  <tr>
                    {/* Spacer */}
                    <td
                      style={{
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        verticalAlign: 'top',
                      }}
                      valign="top"
                    >
                      &nbsp;
                    </td>
                    {/* Main Section */}
                    <td
                      className="container"
                      style={{
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        verticalAlign: 'top',
                        display: 'block',
                        padding: '10px',
                        margin: '0 auto',
                      }}
                      width={580}
                      valign="top"
                    >
                      <div
                        className="content"
                        style={{
                          boxSizing: 'border-box',
                          display: 'block',
                          margin: '0 auto',
                          padding: '10px',
                        }}
                      >
                        {/* START CENTERED WHITE CONTAINER */}
                        <table
                          role="presentation"
                          className="main"
                          style={{
                            borderCollapse: 'separate',
                            background: '#ffffff',
                            borderRadius: '3px',
                            width: '100%',
                          }}
                          width="100%"
                        >
                          {/* START MAIN CONTENT AREA */}
                          <tbody>
                            <tr>
                              <td
                                className="wrapper"
                                style={{
                                  fontFamily: 'sans-serif',
                                  fontSize: '16px',
                                  verticalAlign: 'top',
                                  boxSizing: 'border-box',
                                  padding: '24px',
                                }}
                                valign="top"
                              >
                                {/* logo header */}
                                <table
                                  role="presentation"
                                  border={0}
                                  cellPadding={0}
                                  cellSpacing={0}
                                  style={{
                                    borderCollapse: 'separate',
                                    width: '100%',
                                  }}
                                  width="100%"
                                >
                                  <tbody>
                                    <tr>
                                      <td>
                                        <img
                                          src="/images/unlock-logo.png"
                                          width={91}
                                          height={40}
                                          style={{ marginBottom: '24px' }}
                                          alt="Unlock Protocol"
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                {/* logo header end */}
                                <table
                                  role="presentation"
                                  border={0}
                                  cellPadding={0}
                                  cellSpacing={0}
                                  style={{
                                    borderCollapse: 'separate',
                                    width: '100%',
                                  }}
                                  width="100%"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style={{
                                          fontFamily: 'sans-serif',
                                          fontSize: '16px',
                                          verticalAlign: 'top',
                                        }}
                                        valign="top"
                                      >
                                        {header && header?.length > 0 && (
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: header,
                                            }}
                                          />
                                        )}
                                        <div
                                          style={{
                                            background: '#f5f5f5',
                                            padding: '2px',
                                          }}
                                        >
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: customContent,
                                            }}
                                          />
                                        </div>

                                        {footer && footer?.length > 0 && (
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: footer,
                                            }}
                                          />
                                        )}
                                        <p style={{ marginTop: '40px' }}>
                                          -<br />
                                          If you have any questions, you can
                                          always email us at
                                          <br />
                                          <a
                                            href="mailto:hello@unlock-protocol.com"
                                            style={{
                                              color: '#603deb',
                                              fontFamily: 'sans-serif',
                                              textDecoration: 'none',
                                            }}
                                          >
                                            hello@unlock-protocol.com.
                                          </a>
                                        </p>
                                        <p>Unlock Labs</p>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            {/* END MAIN CONTENT AREA */}
                          </tbody>
                        </table>
                        {/* END CENTERED WHITE CONTAINER */}
                        {/* START FOOTER*/}
                        <div
                          className="footer"
                          style={{
                            clear: 'both',
                            marginTop: '16px',
                            textAlign: 'center',
                            width: '100%',
                          }}
                        >
                          <table
                            role="presentation"
                            border={0}
                            cellPadding={0}
                            cellSpacing={0}
                            style={{
                              borderCollapse: 'separate',
                              width: '100%',
                            }}
                            width="100%"
                          >
                            <tbody>
                              <tr>
                                <td
                                  className="content-block"
                                  style={{
                                    fontFamily: 'sans-serif',
                                    verticalAlign: 'top',
                                    paddingBottom: '10px',
                                    paddingTop: '10px',
                                    color: '#999999',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                  }}
                                  valign="top"
                                  align="center"
                                >
                                  <table
                                    role="presentation"
                                    border={0}
                                    cellPadding={0}
                                    cellSpacing={0}
                                    align="center"
                                    style={{
                                      borderCollapse: 'separate',
                                      width: '30%',
                                      marginBottom: '32px',
                                    }}
                                    width="30%"
                                  >
                                    <tbody>
                                      <tr>
                                        <td>
                                          <a
                                            href="https://github.com/unlock-protocol"
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            <img
                                              src="/images/github.png"
                                              width={24}
                                              height={24}
                                              alt="Github"
                                            />
                                          </a>
                                        </td>
                                        <td>
                                          <a
                                            href="https://discord.com/invite/Ah6ZEJyTDp"
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            <img
                                              src="/images/discord.png"
                                              width={24}
                                              height={24}
                                              alt="Discord"
                                            />
                                          </a>
                                        </td>
                                        <td>
                                          <a
                                            href="https://twitter.com/UnlockProtocol"
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            <img
                                              src="/images/twitter.png"
                                              height={24}
                                              width={24}
                                              alt="Twitter"
                                            />
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table
                                    role="presentation"
                                    border={0}
                                    cellPadding={0}
                                    cellSpacing={0}
                                    align="center"
                                    style={{
                                      borderCollapse: 'separate',
                                      width: '100%',
                                      marginBottom: '16px',
                                      textAlign: 'center',
                                    }}
                                    width="100%"
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          style={{
                                            fontSize: '14px',
                                            color: '',
                                          }}
                                        >
                                          <a
                                            href="https://app.unlock-protocol.com/dashboard"
                                            target="_blank"
                                            style={{
                                              color: '#373a3e',
                                              textDecoration: 'none',
                                            }}
                                            rel="noreferrer"
                                          >
                                            Dashboard{' '}
                                          </a>
                                          |
                                          <a
                                            href="https://docs.unlock-protocol.com/"
                                            target="_blank"
                                            style={{
                                              color: '#373a3e',
                                              textDecoration: 'none',
                                            }}
                                            rel="noreferrer"
                                          >
                                            Docs
                                          </a>
                                          |
                                          <a
                                            href="https://unlock-protocol.com/guides/"
                                            target="_blank"
                                            style={{
                                              color: '#373a3e',
                                              textDecoration: 'none',
                                            }}
                                            rel="noreferrer"
                                          >
                                            Guides
                                          </a>
                                          |
                                          <a
                                            href="https://unlock-protocol.com/grants"
                                            target="_blank"
                                            style={{
                                              color: '#373a3e',
                                              textDecoration: 'none',
                                            }}
                                            rel="noreferrer"
                                          >
                                            Grant
                                          </a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <span
                                    className="apple-link"
                                    style={{
                                      color: '#373a3e',
                                      fontSize: '20px',
                                      fontWeight: 'bold',
                                      textAlign: 'center',
                                    }}
                                  >
                                    <a
                                      href="https://unlock-protocol.com/"
                                      target="_blank"
                                      style={{
                                        color: '#373a3e',
                                        textDecoration: 'none',
                                      }}
                                      rel="noreferrer"
                                    >
                                      Unlock Protocol
                                    </a>
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        {/* END FOOTER */}
                      </div>
                    </td>
                    <td
                      style={{
                        fontFamily: 'sans-serif',
                        fontSize: '14px',
                        verticalAlign: 'top',
                      }}
                      valign="top"
                    >
                      &nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="example@email.com"
                  type="email"
                  disabled={disabled}
                  className="w-full"
                  {...register('email', {
                    required: {
                      value: true,
                      message: 'This field is required.',
                    },
                  })}
                  error={errors?.email?.message}
                />
                <Button type="submit" disabled={disabled}>
                  Send email Preview
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </>
  )
}
