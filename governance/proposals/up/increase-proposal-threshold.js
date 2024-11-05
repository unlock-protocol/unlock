module.exports = {
    proposalName: `Increase proposal threshold`,
    calls: [
        {
            contractNameOrAbi: "GovernorUnlockProtocol",
            contractAddress: "0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9",
            functionName: "setProposalThreshold",
            functionArgs: "50000000000000000000000",
        },
    ],
}
