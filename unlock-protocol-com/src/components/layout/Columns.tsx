import type { ComponentPropsWithRef } from 'react'
import { Box } from '@unlock-protocol/ui'
import { twMerge } from 'tailwind-merge'
export function CenteredColumn({
  className,
  ...rest
}: ComponentPropsWithRef<typeof Box>) {
  const CenteredColumnClass = twMerge('max-w-7xl	 mx-auto', className)
  return <Box className={CenteredColumnClass} {...rest} />
}
