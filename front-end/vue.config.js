const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "0.0.0.0",
    port: 8082,
    allowedHosts: "all",
    proxy: {
      "/api": {
        target: process.env.VUE_APP_API_BASE || "http://localhost:8081",
        changeOrigin: true,
      },
    },
  },
});
