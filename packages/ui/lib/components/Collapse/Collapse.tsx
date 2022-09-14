import { useEffect, useState } from 'react'
import { Button } from '../Button/Button'
import { FiChevronUp as ArrowUpIcon } from 'react-icons/fi'

interface CollapseProps {
  collapsed?: boolean
  content: React.ReactNode
  children: React.ReactNode
  disabled?: boolean
}
export const Collapse = ({
  children,
  content,
  disabled = false,
  collapsed = false,
}: CollapseProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const onCollapse = () => {
    if (disabled) return
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    setIsOpen(collapsed)
  }, [collapsed])

  return (
    <div className="bg-white border border-gray-200 rounded-2xl">
      <div className="flex items-start gap-3 p-4">
        <div className="col-span-full md:col-span-1">
          <Button
            variant="transparent"
            className="p-0 m-0"
            onClick={onCollapse}
            disabled={disabled}
          >
            <div className="flex items-center justify-center w-8 h-8 border border-black rounded-full click:border-brand-secondary ">
              <ArrowUpIcon
                className={`transition duration-200 ease-in-out ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </Button>
        </div>
        <div className="w-full">{content}</div>
      </div>
      {extend && <div className="p-6">{children}</div>}
    </div>
  )
}
