import { InputHTMLAttributes, forwardRef } from 'react'
import { FieldLayout } from './FieldLayout'
import { Size, SizeStyleProp } from '~/types'
import { twMerge } from 'tailwind-merge'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  description?: string
  fieldSize?: Size
}

export const SIZE_STYLES: SizeStyleProp = {
  small: 'w-4	h-4 text-base md:text-sm',
  medium: 'w-5 h-5 text-base',
  large: 'w-6	h-6 text-base',
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, description, fieldSize = 'medium', ...rest }, ref) => {
    const inputSizeStyle = SIZE_STYLES[fieldSize]

    const inputClass = twMerge(
      'box-border rounded-md transition-all shadow-sm border border-gray-400 hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none disabled:bg-gray-100 cursor-pointer focus:outline-0 hover:outline-0 outline-0 focus:ring-transparent',
      inputSizeStyle
    )

    return (
      <FieldLayout size={fieldSize} description={description} error={error}>
        <div className="flex items-center gap-3">
          <input ref={ref} type="checkbox" className={inputClass} {...rest} />
          <label className="text-sm" htmlFor={label}>
            {label}
          </label>
        </div>
      </FieldLayout>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
