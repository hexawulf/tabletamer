module.exports = {
  apps: [
    {
      name: 'tabletamer',
      script: '/home/zk/projects/tabletamer/dist/index.js',
      cwd: '/home/zk/projects/tabletamer',
      env: {
        NODE_ENV: 'production',
      },
      watch: ['dist'],
      ignore_watch: ['node_modules', 'logs', '*.log'],
      max_memory_restart: '300M',
      restart_delay: 2000,
      max_restarts: 10,
      out_file: '/home/zk/logs/tabletamer-out.log',
      error_file: '/home/zk/logs/tabletamer-err.log',
      merge_logs: true,
    },
  ],
};
