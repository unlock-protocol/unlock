const tasks = (tasks) => {
  return tasks
    .map((task) => {
      return `cd ${__dirname}/${task.path} && ${task.command}`
    })
    .join(`&& cd ${__dirname} && `)
}

// Run eslint on the files inside path for the last commit
// It will try to amend the latest commit if possible to fix.
const eslint = (path) => {
  return {
    command: `git diff --name-only --diff-filter=d $(git merge-base origin/master HEAD) | grep "^${path}.*js$" | sed 's/${path}\\///' | xargs eslint --fix`,
    path: path,
  }
}

// lintStaged actually just runs formatting rules on staged files
const lintStaged = (path) => {
  return { command: `echo ${path} && lint-staged`, path: path }
}

const subDirs = [
  'locksmith',
  'paywall',
  'smart-contracts',
  'governance',
  'tests',
  'unlock-app',
  'paywall',
  'unlock-js',
  'unlock-protocol.com',
]

const prePushTasks = subDirs.map((dir) => {
  return eslint(dir)
})

const preCommitTasks = subDirs.map((dir) => {
  return lintStaged(dir)
})

const config = {
  hooks: {
    'pre-push': tasks(prePushTasks),
    'pre-commit': tasks(preCommitTasks),
  },
}

module.exports = config
