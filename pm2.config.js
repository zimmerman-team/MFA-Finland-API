module.exports = {
  apps: [
    {
      name: "mfa-api",
      script: "ts-node",
      args: "--project nodetsconfig.json ./server/server.ts",

      instances: 1,
      max_memory_restart: "1G",
      autorestart: true,
      restart_delay: 100,
      error_file: "/home/zz/app-logs/mfa-api/error.log",
      out_file: "/home/zz/app-logs/mfa-api/out.log",
      watch: true,
      ignore_watch: [
        ".circle",
        ".vscode",
        "README.md",
        "yarn.lock",
        ".gitignore",
        "node_modules",
        "nodemon.json",
        "package.json",
        "tsconfig.json",
        "nodetsconfig.json"
      ]
    }
  ]
};
