import { classed } from '@tw-classed/react'
import React, { forwardRef } from 'react'

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

const CardTitleBase = classed.span('text-xl font-bold text-brand-ui-primary')
const CardDescriptionBase = classed.span('text-base text-brand-dark"')

type CardBaseProps = React.ComponentProps<typeof CardBase> & {
  icon?: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  children?: React.ReactNode
}

// Create wrapper components with forwardRef to ensure React 19 compatibility
const CardTitleComponent = forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof CardTitleBase>
>((props, ref) => <CardTitleBase {...props} ref={ref} />)

CardTitleComponent.displayName = 'CardTitle'

const CardDescriptionComponent = forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof CardDescriptionBase>
>((props, ref) => <CardDescriptionBase {...props} ref={ref} />)

CardDescriptionComponent.displayName = 'CardDescription'

interface CardLabelProps {
  title: string
  description?: string
}

const CardLabel = ({ title, description }: CardLabelProps) => {
  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <CardTitleComponent>{title}</CardTitleComponent>
      {description && (
        <CardDescriptionComponent>{description}</CardDescriptionComponent>
      )}
    </div>
  )
}

// Use a more direct approach to avoid type issues
const Card = (props: CardBaseProps) => {
  const { variant, shadow, padding, children, className, as, ...rest } = props
  return (
    <CardBase
      variant={variant}
      padding={padding}
      shadow={shadow}
      className={className}
      as={as || 'div'}
      {...rest}
    >
      {children}
    </CardBase>
  )
}

// Use "as any" casting for React 19 compatibility
Card.Title = CardTitleComponent as any
Card.Description = CardDescriptionComponent as any
Card.Label = CardLabel

export { Card }
