import React, { useEffect, useState } from 'react'

import numeral from 'numeral'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { getGNPs } from '../../../../utils/apiRequest'

export function GNP() {
  const [gnpValues, setGNPValues] = useState<any[]>([])

  useEffect(() => {
    const run = async () => {
      const values = await getGNPs()
      values.sort((a, b) => {
        if (a.total < b.total) return 1
        if (a.total > b.total) return -1
        return 0
      })
      setGNPValues(values)
    }
    run()
  }, [])

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2">
      {gnpValues
        .filter((item) => !item.network.isTestNetwork)
        .map(({ total, network }, index) => (
          <div key={index} className="p-4 border border-gray-300 rounded-md">
            <div className="flex justify-between pb-2">
              <p className="text-xl font-bold">{network.name}</p>
            </div>

            <div className="flex justify-start pt-2 border-t border-gray-300">
              <CryptoIcon
                className="mr-2"
                symbol={network.nativeCurrency.symbol}
                size={40}
              />
              <p className="self-center pr-2 heading-small">
                {numeral(total).format('0,0.000')}{' '}
              </p>
              <p className="self-center pr-2 heading-small">
                {network.nativeCurrency.symbol}
              </p>
            </div>
          </div>
        ))}
    </div>
  )
}
