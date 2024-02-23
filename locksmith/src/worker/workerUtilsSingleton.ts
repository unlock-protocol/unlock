import { Pool } from 'pg'
import { WorkerUtils, makeWorkerUtils } from 'graphile-worker'
import config from '../config/config'

class WorkerUtilsSingleton {
  private static instance: WorkerUtils

  static async getInstance(): Promise<WorkerUtils> {
    if (!WorkerUtilsSingleton.instance) {
      const pgPool = new Pool({
        connectionString: config.databaseUrl,
      })
      WorkerUtilsSingleton.instance = await makeWorkerUtils({
        pgPool,
      })
    }
    return WorkerUtilsSingleton.instance
  }
}

export default WorkerUtilsSingleton
