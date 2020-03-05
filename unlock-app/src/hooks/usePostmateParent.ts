import { useState, useEffect } from 'react'
import { ChildAPI, Model } from 'postmate'

export const usePostmateParent = (model: any = {}) => {
  const [parent, setParent] = useState<ChildAPI | undefined>(undefined)

  const handshake = async () => {
    const parent = await new Model(model)
    setParent(parent)
  }

  useEffect(() => {
    handshake()
  }, [])

  return parent
}
