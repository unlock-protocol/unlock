import React from 'react'
import {
  DashboardLayoutProps,
  AppLayout as OriginalAppLayout,
} from '../../src/components/interface/layouts/AppLayout'
import { ReactNode } from 'react'

export default function AppLayout({
  children,
  ...props
}: DashboardLayoutProps & { children: ReactNode }) {
  return <OriginalAppLayout {...props}>{children}</OriginalAppLayout>
}
