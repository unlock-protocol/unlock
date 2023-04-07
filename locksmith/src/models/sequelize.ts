import { Sequelize, Utils, DataTypes } from 'sequelize'

import logger from '../logger'
import config from '../config/config'

logger.info(`Connecting to database`)

type LocksmithDataTypesType = typeof DataTypes & { NETWORK_ID: any }

/**
 * We need a custom type for networks.
 * The chain/network id can be larger than the max INTEGER value in postgres (for example Palm's is 11297108109 which is larger than 2147483647),
 * so we would need to use BIGINT...
 * But Sequelize, by default, treats this as BigInt and strings... which is not right because our app assumes
 * these are numbers.
 * We are introducing a custom Postgress type (domain)
 */
// @ts-expect-error Base constructors must all have the same return type.
class NETWORK_ID extends DataTypes.BIGINT {
  // Optional: parser for values received from the database
  static parse(value: string): number {
    const number = Number.parseInt(value)
    if (number > Number.MAX_SAFE_INTEGER) {
      throw new Error('Bignumber too large')
    }
    return number
  }
}

NETWORK_ID.prototype.key = NETWORK_ID.key = 'NETWORK_ID'

// @ts-expect-error Property 'postgres' does not exist on type 'typeof import("/Users/julien/repos/unlock/node_modules/sequelize/types/data-types")'.
const PgTypes = DataTypes.postgres

class PgNetworkId extends PgTypes.BIGINT {
  // Optional: validator function
  validate(value: number) {
    return (
      typeof value === 'number' &&
      !Number.isNaN(value) &&
      value <= Number.MAX_SAFE_INTEGER
    )
  }

  static parse(value: string): number {
    const number = Number.parseInt(value)
    if (number > Number.MAX_SAFE_INTEGER) {
      throw new Error('Bignumber too large')
    }
    return number
  }
}

export const LocksmithDataTypes: LocksmithDataTypesType = {
  ...DataTypes,
  NETWORK_ID: Utils.classToInvokable(NETWORK_ID),
}

PgTypes.NETWORK_ID = PgNetworkId

export const sequelize = new Sequelize(config.database)
