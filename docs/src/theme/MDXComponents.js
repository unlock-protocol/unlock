// src/theme/MDXComponents/index.js
import React from 'react'
import OriginalMDXComponents from '@theme-original/MDXComponents'
import QueryWrapper from '../components/QueryWrapper'
import PrivyWrapper from '../components/PrivyWrapper'

export default {
  ...OriginalMDXComponents,
  wrapper: ({ children }) => (
    <QueryWrapper>
      <PrivyWrapper>{children}</PrivyWrapper>
    </QueryWrapper>
  ),
}
