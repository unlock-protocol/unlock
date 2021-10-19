//Initial form values 
export const initialValues = {
  locks: [{ address: "", network: "1", name: "" }],
  icon: "",
  pessimistic: "false",
  callToAction: {},
  defaultValueCall: "Please join this membership!",
  metadataInputs: [{}]
}
//Networks where unlock works 
export const networks = {
  1: "Mainnet",
  100: "xDai",
  137: "Polygon",
  4: "Rinkeby",
};

export const labels = {
  icon: "Icon URL(optional):",
  referrer: "Referrer(optional):",
  messageToSign: "Message to Sign(optional)"
};

export const calltoAction = {
  default: "",
  expired: "",
  metadata: ""
}

//Function to generate JSON
export async function genJson(value) {
 let locks = {}
 
 //This code helps to enumerate all the locks added in the form to convert it into an object 
  value.locks.map(({address, network, name}, i) => ( 
    Object.defineProperty(locks, `${address}`, {
      value: {
        network: network,
        name: name
      },
      enumerable: true
    })
  ))

//this is the object where the final JSON will be generated 
  const unlockPaywall = {
    pessimistic: value.pessimistic,
    locks: {
      ...locks
    },
    icon: value.icon,
    messageToSign: value.messageToSign,
    callToAction: {
      ...value.calltoAction
    },
   referrer: value.referrer
  };

//Same like locks for the metadataInputs 
  if(value.metadataInputs.length > 0 && value.metadataInputs[0].name !== undefined ){
    Object.defineProperty(unlockPaywall, 'metadataInputs', {
      value: [...value.metadataInputs],
      enumerable: true,
    });
  }
 
  const fin = await JSON.stringify(unlockPaywall, null, 2);

  return fin;
}

//validate the empty locks field and metada if is required 
export const validateField = (value)=>{
  let error 
  if(!value){
    error = 'Required'
  }
  return error
} 
//function that generate the paywall URL 
export async function genUrl(value){
  const json = await genJson(value)
  const enconde = await encodeURIComponent(json)
  const uri = `https://app.unlock-protocol.com/checkout?paywallConfig=${enconde}`
  
  return uri
}

