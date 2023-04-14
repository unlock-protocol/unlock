import { classed } from '@tw-classed/react'

const CardBase = classed.div('w-full rounded-2xl', {
  variants: {
    variant: {
      simple: 'bg-white',
      primary: 'bg-white border border-gray-200',
      secondary: 'border border-ui-secondary-600 bg-ui-secondary-400',
      danger: 'border border-red-300 bg-red-50',
      transparent: 'border border-gray-500',
    },
    padding: {
      xs: 'p-4',
      sm: 'p-4 md:p-6',
      md: 'p-4 md:p-8',
    },
    shadow: {
      sm: 'shadow-sm',
      lg: 'shadow-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    padding: 'sm',
  },
})

const CardTitle = classed.span('text-xl font-bold text-brand-ui-primary')
const CardDescription = classed.span('text-base text-brand-dark"')

type CardBaseProps = React.ComponentProps<typeof CardBase> & {
  icon?: React.ReactNode
  as?: keyof JSX.IntrinsicElements
}

const CardLabel = ({ title, description }: CardLabelProps) => {
  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </div>
  )
}
const Card = ({
  variant,
  shadow,
  padding,
  children,
  className,
  as,
}: CardBaseProps) => {
  return (
    <CardBase
      variant={variant}
      padding={padding}
      shadow={shadow}
      className={className}
      as={as || 'div'}
    >
      {children}
    </CardBase>
  )
}

interface CardLabelProps {
  title: string
  description?: string
}

Card.Title = CardTitle
Card.Description = CardDescription
Card.Label = CardLabel

export { Card }
