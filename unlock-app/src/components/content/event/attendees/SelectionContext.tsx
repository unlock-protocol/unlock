import React, { createContext, useContext, useState, useCallback } from 'react'

interface SelectionContextType {
  selected: { [key: string]: boolean }
  setSelected: (value: { [key: string]: boolean }) => void
  toggleSelection: (owner: string) => void
  clearSelections: () => void
  isSelected: (owner: string) => boolean
}

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
)

export const SelectionProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({})

  const toggleSelection = useCallback((owner: string) => {
    setSelected((prev) => ({
      ...prev,
      [owner]: !prev[owner],
    }))
  }, [])

  const clearSelections = useCallback(() => {
    setSelected({})
  }, [])

  const isSelected = useCallback(
    (owner: string) => {
      return !!selected[owner]
    },
    [selected]
  )

  return (
    <SelectionContext.Provider
      value={{
        selected,
        setSelected,
        toggleSelection,
        clearSelections,
        isSelected,
      }}
    >
      {children}
    </SelectionContext.Provider>
  )
}

export const useSelection = () => {
  const context = useContext(SelectionContext)
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider')
  }
  return context
}
