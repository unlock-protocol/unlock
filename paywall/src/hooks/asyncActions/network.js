export default async (handle, wallet) => {
  handle(await wallet.eth.net.getId())
}
