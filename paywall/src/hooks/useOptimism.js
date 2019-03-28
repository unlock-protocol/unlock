import useLocksmith from './useLocksmith'

export default function useOptimism(transactionHash) {
  return useLocksmith(`/transaction/${transactionHash}/odds`, {
    willSucceed: 1,
  }).willSucceed
}
