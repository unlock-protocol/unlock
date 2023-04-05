import { Sequelize } from 'sequelize'

import logger from '../logger'
import config from '../config/config'

logger.info(`Connecting to database`)

/**
 * We need a custom type for networks.
 * The chain/network id can be larger than the max INTEGER value in postgres, so we need to use BIGINT...
 * But Sequelize, by default, treats this as BigInt and strings... which is not right because our app assumes
 * these are numbers.
 *
 */
function createNetworkType() {}

// We assume config from an object of {username, password, database, host, dialect}
export const sequelize = new Sequelize(config.database)
