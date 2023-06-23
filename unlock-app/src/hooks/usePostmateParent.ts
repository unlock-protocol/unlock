import { useState, useEffect } from 'react'
import Postmate from 'postmate'

export const usePostmateParent = (model: any = {}) => {
  const [parent, setParent] = useState<Postmate.ChildAPI | undefined>(undefined)

  const handshake = async () => {
    const parent = await new Postmate.Model(model)
    setParent(parent)
  }

  useEffect(() => {
    handshake()
  }, [])

  return parent
}
