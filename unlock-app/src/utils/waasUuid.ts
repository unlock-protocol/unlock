import { config } from '~/config/app'
import { StorageService } from '~/services/storageService'

export const getWaasUuid = async () => {
  // We should get email here from somewhere since it is not possible to pass it as an argument
  const storageService = new StorageService(config.services.storage.host)
  const waasToken = await storageService.getUserWaasUuid('gg@gg.g')

  return waasToken
}
