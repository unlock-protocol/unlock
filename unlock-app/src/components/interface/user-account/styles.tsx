import React from 'react'

const columnSpans = {
  full: 12,
  threeQuarter: 9,
  half: 6,
  third: 4,
  quarter: 3,
}

type ColumnSize = 'full' | 'half' | 'third' | 'quarter' | 'threeQuarter'
interface ItemProps {
  title: string
  children: React.ReactNode
  count: ColumnSize
}
export const Item = ({ title, children, count }: ItemProps) => {
  return (
    <div
      className={`flex flex-col content-end ${
        !count ? 'col-span-6' : `col-span-${columnSpans[count]}`
      }`}
    >
      {title?.length && (
        <div className="flex items-center text-xs font-normal tracking-widest text-gray-400 uppercase">
          {title}
        </div>
      )}
      {children}
    </div>
  )
}
