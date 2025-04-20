module.exports = {
  devServer: (config) => {
    config.client.overlay = false;
    return config;
  },
};
