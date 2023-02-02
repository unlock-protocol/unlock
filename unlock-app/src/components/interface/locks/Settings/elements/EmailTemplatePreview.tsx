import { Button, Input, Modal, TextBox } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface EmailTemplatePreviewProps {
  header?: string
  footer?: string
  customContent?: string
}

export const EmailTemplatePreview = ({
  header,
  footer,
}: EmailTemplatePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false)
  const [customContent, setCustomContent] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>()

  const onSubmit = () => {}
  return (
    <div className="flex flex-col justify-start gap-3">
      <TextBox onChange={(e) => setCustomContent(e.target.value)} />
      <div className="ml-auto">
        <Button size="small" onClick={() => setShowPreview(!showPreview)}>
          Show preview
        </Button>
      </div>
      {showPreview && (
        <Modal isOpen={showPreview} setIsOpen={setShowPreview}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col w-full gap-6 py-4"
          >
            <span className="text-xl font-bold text-center text-brand-ui-primary">
              Email Preview
            </span>
            <table
              role="presentation"
              border={0}
              cellPadding={0}
              cellSpacing={0}
              className="body"
              style={{
                borderCollapse: 'separate',
                msoTableLspace: '0pt',
                msoTableRspace: '0pt',
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
                          msoTableLspace: '0pt',
                          msoTableRspace: '0pt',
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
                                  msoTableLspace: '0pt',
                                  msoTableRspace: '0pt',
                                  width: '100%',
                                }}
                                width="100%"
                              >
                                <tbody>
                                  <tr>
                                    <td>
                                      <img
                                        src="{{inlineImage 'unlock-logo.png'}}"
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
                                  msoTableLspace: '0pt',
                                  msoTableRspace: '0pt',
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
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: header,
                                        }}
                                      />
                                      <div
                                        style={{
                                          background: '#f5f5f5',
                                          padding: '5px 2px',
                                          margin: '10px 0',
                                        }}
                                      >
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: customContent,
                                          }}
                                        />
                                      </div>

                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: footer,
                                        }}
                                      />
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
                            msoTableLspace: '0pt',
                            msoTableRspace: '0pt',
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
                                    msoTableLspace: '0pt',
                                    msoTableRspace: '0pt',
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
                                            src="{{inlineImage 'github.png'}}"
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
                                            src="{{inlineImage 'discord.png'}}"
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
                                            src="{{inlineImage 'twitter.png'}}"
                                            height={24}
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
                                    msoTableLspace: '0pt',
                                    msoTableRspace: '0pt',
                                    width: '100%',
                                    marginBottom: '16px',
                                    textAlign: 'center',
                                  }}
                                  width="100%"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        style={{ fontSize: '14px', color: '' }}
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
                {...register('email', {
                  required: {
                    value: true,
                    message: 'This field is required.',
                  },
                })}
                error={errors?.email?.message}
              />
              <Button type="submit" size="small">
                Send email Preview
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
