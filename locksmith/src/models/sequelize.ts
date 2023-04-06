import { Sequelize, Utils, DataTypes } from 'sequelize'

import logger from '../logger'
import config from '../config/config'

logger.info(`Connecting to database`)

type LocksmithDataTypesType = typeof DataTypes & { NETWORK_ID: any }

/**
 * We need a custom type for networks.
 * The chain/network id can be larger than the max INTEGER value in postgres, so we need to use BIGINT...
 * But Sequelize, by default, treats this as BigInt and strings... which is not right because our app assumes
 * these are numbers.
 *
 */
// @ts-expect-error Base constructors must all have the same return type.
class NETWORK_ID extends DataTypes.BIGINT {
  // Optional: parser for values received from the database
  static parse(value: string): number {
    return Number.parseInt(value)
  }
}

NETWORK_ID.prototype.key = NETWORK_ID.key = 'NETWORK_ID'

// @ts-expect-error Property 'postgres' does not exist on type 'typeof import("/Users/julien/repos/unlock/node_modules/sequelize/types/data-types")'.
const PgTypes = DataTypes.postgres

class PgNetworkId extends PgTypes.BIGINT {
  static parse(x: string): number {
    return Number.parseInt(x)
  }
}

export const LocksmithDataTypes: LocksmithDataTypesType = {
  ...DataTypes,
  NETWORK_ID: Utils.classToInvokable(NETWORK_ID),
}

PgTypes.NETWORK_ID = PgNetworkId

export const sequelize = new Sequelize(config.database)
