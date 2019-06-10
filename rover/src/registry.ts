import { RegistryKey } from "./entity/RegistryKey";

export class Registry {
  static get = async connection => {
    let result = await connection
      .getRepository(RegistryKey)
      .createQueryBuilder("registry_key")
      .getMany();

    return result.map(registree => registree.address);
  };
}
