module.exports = {
  apps: [
    {
      name: 'tabletamer',
      script: '/home/zk/projects/tabletamer/dist/index.js',
      cwd: '/home/zk/projects/tabletamer',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 5000,
      },
      // TT-09: never watch dist in production — a rebuild would restart the
      // process mid-build.
      watch: false,
      max_memory_restart: '300M',
      restart_delay: 2000,
      max_restarts: 10,
      out_file: '/home/zk/logs/tabletamer-out.log',
      error_file: '/home/zk/logs/tabletamer-err.log',
      merge_logs: true,
    },
  ],
};
