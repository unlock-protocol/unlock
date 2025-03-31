import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { Button, Input, Placeholder } from '@unlock-protocol/ui'
import { useWedlockService } from '~/contexts/WedlocksContext'
import { useEmailPreview } from '~/hooks/useEmailPreview'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '@unlock-protocol/ui'

// styles for email custom markdown content
const customContentMarkdownStyles = `
  /* Target the email section for markdown content */
  section[style*="background: #F8FAFC"] {
    font-family: ui-sans-serif, system-ui, sans-serif !important;
  }
  
  /* Headings */
  section[style*="background: #F8FAFC"] h1 {
    font-size: 1.6em;
    font-weight: bold;
    margin-top: 1em;
    margin-bottom: 0.5rem;
  }
  
  section[style*="background: #F8FAFC"] h2 {
    font-size: 1.4em;
    font-weight: bold;
    margin-top: 0.8em;
    margin-bottom: 0.5rem;
  }
  
  section[style*="background: #F8FAFC"] h3 {
    font-size: 1.2em;
    font-weight: bold;
    margin-top: 0.6em;
    margin-bottom: 0.5rem;
  }
  
  /* Paragraphs */
  section[style*="background: #F8FAFC"] p {
    margin-bottom: 1em;
  }
  
  /* Lists */
  section[style*="background: #F8FAFC"] ul { list-style-type: disc; }
  section[style*="background: #F8FAFC"] ol { list-style-type: decimal; }
  
  section[style*="background: #F8FAFC"] ul,
  section[style*="background: #F8FAFC"] ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }
  
  section[style*="background: #F8FAFC"] li {
    margin-bottom: 0.25rem;
  }
  
  /* Links */
  section[style*="background: #F8FAFC"] a {
    color: #603deb !important;
    text-decoration: underline;
  }
  
  /* Blockquotes */
  section[style*="background: #F8FAFC"] blockquote {
    border-left: 4px solid #e2e8f0;
    padding-left: 1rem;
    font-style: italic;
    margin: 0.5rem 0;
  }
  
  /* Code */
  section[style*="background: #F8FAFC"] code {
    font-size: 14px;
    border-radius: 0.375rem;
    font-weight: 500;
    border-style: solid;
    border-width: 1px;
    border-color: rgb(203 213 225);
    background-color: rgb(241 245 249);
    padding: 0.125rem 0.25rem;
  }
  
  /* Horizontal rule */
  section[style*="background: #F8FAFC"] hr {
    margin: 1rem 0;
    border: 0;
    border-top: 1px solid #e2e8f0;
  }
`

export const EmailPreview = ({
  templateId,
  setShowPreview,
  emailParams,
  sendingParams,
}: {
  templateId: string
  setShowPreview: (show: boolean) => void
  emailParams: any
  sendingParams?: {
    replyTo?: string | null
    emailSender?: string | null
  }
}) => {
  const wedlocksService = useWedlockService()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      emailAddress: '',
    },
  })

  const { data: email, isLoading } = useEmailPreview({
    templateId,
    params: emailParams,
  })

  console.log(sendingParams)
  /**
   * Send preview email
   * @param form
   */
  const onSubmit = async (form: any) => {
    const promise = wedlocksService.sendEmail(
      templateId as any,
      form.emailAddress,
      {
        ...emailParams,
      },
      [], // attachments
      sendingParams?.replyTo,
      sendingParams?.emailSender
    )
    await ToastHelper.promise(promise, {
      loading: 'Sending email preview...',
      success: 'Email preview sent.',
      error: "Can't send email preview",
    })
  }

  return (
    <div className="w-full max-w-xl mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-ui-primary">Preview</h2>
        <div className="flex items-center justify-end">
          <button
            className="hover:fill-brand-ui-primary"
            aria-label="close"
            onClick={(event) => {
              event.preventDefault()
              setShowPreview(false)
            }}
          >
            <CloseIcon className="fill-inherit" size={24} />
          </button>
        </div>
      </div>
      {isLoading && (
        <Placeholder.Root>
          <Placeholder.Line size="lg" />
          <Placeholder.Line size="sm" />
          <Placeholder.Line size="sm" />
        </Placeholder.Root>
      )}
      {!isLoading && email && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full gap-6 py-4"
        >
          <ul>
            <li>Email subject: {email?.subject}</li>
          </ul>
          <style>{customContentMarkdownStyles}</style>
          <div
            dangerouslySetInnerHTML={{
              __html: email?.html || '',
            }}
            className="text-left"
          />
          <div className="flex flex-col gap-2">
            <Input
              placeholder="your@email.com"
              type="email"
              className="w-full"
              {...register('emailAddress', {
                required: {
                  value: true,
                  message: 'This field is required.',
                },
              })}
              error={errors?.emailAddress?.message}
            />
            <Button type="submit">Send email preview</Button>
          </div>
        </form>
      )}
    </div>
  )
}
