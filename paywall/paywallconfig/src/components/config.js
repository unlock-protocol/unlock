export const initialValues = {
  locks: [{ address: "", network: "1", name: "" }],
  icon: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.10UUFNA8oLdFdDpzt-Em_QHaHa%26pid%3DApi&f=1",
  pessimistic: "false",
  defaultValueCall: "Please join this membership!",
  metadataInputs: [{}]
}

export const networks = {
  1: "Mainnet",
  100: "xDai",
  137: "Polygon",
  4: "Rinkeby",
};

export const labels = {
  icon: "Icon URL(optional):",
  default: "Set a Message(optional):",
  referrer: "Referrer(optional):",
};

export async function genJson(value) {
 let locks = {}
  value.locks.map(({address, network, name}, i) => (
    Object.defineProperty(locks, `${address}`, {
      value: {
        network: network,
        name: name
      },
      enumerable: true
    })
  ))

  const unlockPaywall = {
    pessimistic: value.pessimistic,
    locks: {
      ...locks
    },
    icon: value.icon,
    callToAction: {
      default: value.defaultValueCall
    },
   referrer: value.referrer
  };

  if(value.metadataInputs.length > 0 && value.metadataInputs[0].name !== undefined ){
    console.log(value.metadataInputs.length, " ", value.metadataInputs.name )
    Object.defineProperty(unlockPaywall, 'metadataInputs', {
      value: [...value.metadataInputs],
      enumerable: true,
    });
  }
 
  const fin = await JSON.stringify(unlockPaywall, null, 2);
 // console.log(fin, "json")
  return fin;
}

export const validateField = (value)=>{
  let error 
  if(!value){
    error = 'Required'
  }
  return error
} 


export async function genUrl(value){
  const json = await genJson(value)
  const enconde = await encodeURIComponent(json)
  const uri = `https://app.unlock-protocol.com/checkout?paywallConfig=${enconde}`
  
  return uri
}

