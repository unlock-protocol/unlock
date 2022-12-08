import { Sequelize } from 'sequelize'

import logger from '../logger'

const config = require('../../config/sequelize.config')

logger.info(`Connecting to database`)

// We assume config from an object of {username, password, database, host, dialect}
export const sequelize = new Sequelize(config)
