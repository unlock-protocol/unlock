module.exports = {
  stories: ['../stories/**/*.stories.js'],
  addons: [],
  webpackFinal: async config => {
    // do mutation to the config

    return config;
  },
};
