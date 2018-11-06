# Important Post-deployment steps:

For the purpose of this document, the term "Significant Deployment" refers to any deployment of a contract to a network other than a local, development network.

This includes the mainnet(1), Morden(2), Ropsten(3), Rinkby(4), Kovan(42) or any other network upon which the contract being deployed is expected to persist, and therefore needs to by tracked.

These are the manual steps required after a Significant Deployment. While requiring manual steps such as commenting out entries in the `.gitignore` file isn't ideal, it's not a lot to ask of the developer performing the deployment, and it removes the need for all other contributers to worry about truffle artifacts or zOS config files. The fact that it's a manual process will force one to consider whether this is the action they really intend to take, and to do so explicitly. It will also prevent

`git add .`

from unintentionally tracking these files and mistakenly commiting them.

 ### Checklist:
After a succesful Significant Deployment,
the following files and directories should be tracked in version control:

#### Main zOS Config:
`./smart-contracts/zos.json`
#### Network files (as applicable) such as:
`./smart-contracts/zos.mainnet.json`

  or

`./smart-contracts/zos.ropsten.json`

etc...

Finally, the build directory should be tracked as well. It is ignored by git by default. You need to comment it out from the `.gitignore` file temporarily to add it to your commit. Please un-comment when finished!:

`./smart-contracts/build/contracts`

 The build directory gets updated even when using zOS, and is the only place where the abi & bytecode are stored (zos doen't store this data on it's own).

Other zOS-created files are ignored, as they are either specific to the individual developer, or refer to temporary "development" networks which don't need to be tracked. refer to `.gitignore`.