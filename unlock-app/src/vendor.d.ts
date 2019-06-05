// This file is meant to declare modules we depend on which do not have @types
// packages available. Defining them here will unblock us, though doing that the
// most convenient way will not buy us any type safety.
declare module 'react-jazzicon'

// TODO: Remove this when we have a TS build of unlock-js
declare module '@unlock-protocol/unlock-js'
