module.exports = {
  apps: [
    {
      name: "AandavarToolingBackend",
      script: "app.js",
      watch: true,
      ignore_watch: [
        "node_modules",
        "node_modules/*",
        "logs/*"
      ],
      output: "logs/pm2/out.log",
      error: "logs/pm2/error.log",
      log: "logs/pm2/combined.outerr.log",
      env: {
        NODE_ENV: "prod",
        PORT: 8882
      },
      env_local: {
        NODE_ENV: "local",
        PORT: 8881
      },
    },
  ],
};
