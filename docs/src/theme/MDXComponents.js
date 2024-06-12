// src/theme/MDXComponents/index.js
import React from 'react'
import OriginalMDXComponents from '@theme-original/MDXComponents'
import QueryWrapper from '../components/QueryWrapper'

export default {
  ...OriginalMDXComponents,
  wrapper: ({ children }) => <QueryWrapper>{children}</QueryWrapper>,
}
