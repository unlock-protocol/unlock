const argv = require("yargs").argv;
const { exec } = require("child_process");

let executeCommand = command => {
  exec(command, function(error, stdout, stderr) {
    console.log(stdout);
    if (stderr) {
      console.log("stderr: " + stderr);
    }
    if (error !== null) {
      console.log("exec error: " + error);
    }
  });
};

let networkMap = {
  local: {
    subgraph: "unlock-protocol/unlock",
    graphNode: "http://localhost:8020/"
  },
  kovan: {
    subgraph: "unlock-protocol/unlock-kovan",
    graphNode: "http://localhost:8020/"
  }
};

function selectConfig() {
  let network = argv.network;
  if (networkMap[network]) {
    config = networkMap[network];
  } else {
    config = networkMap["local"];
  }

  return config;
}

function process(operation) {
  let config = selectConfig();
  executeCommand(
    `graph ${operation} --node ${config.graphNode} ${config.subgraph}`
  );
}


module.exports = {process}