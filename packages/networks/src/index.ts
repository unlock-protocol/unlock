import { NetworkConfigs } from './types';

import {
    mainnet,
    rinkeby,
    xdai,
    polygon,
    localhost
} from './networks';

// re-export by name
export {
    mainnet,
    rinkeby,
    xdai,
    polygon,
    localhost
} from './networks';

// export by chainId
export const networks: NetworkConfigs = {
    1: mainnet,
    4: rinkeby,
    100: xdai,
    137: polygon,
    31337: localhost,
}

export default networks