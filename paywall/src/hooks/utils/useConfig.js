import { useContext } from 'react'
import { ConfigContext } from '../../utils/withConfig'

export default function useConfig() {
  return useContext(ConfigContext)
}
