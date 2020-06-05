module.exports = {
  apps : [
  {
      name: '[DEV] Main Server',
      script: 'index.js',
      args: '',
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYMMDD HH',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        TZ: "Asia/Jakarta"
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: "Asia/Jakarta"
      }
    },
    {
      name: '[DEV] Topup Deposit',
      script: './src/Jobs/TopupDeposit/TopupDeposit.js',
      args: '',
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYMMDD HH',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        TZ: "Asia/Jakarta"
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: "Asia/Jakarta"
      }
    },
    {
      name: '[DEV] Payment Certificate',
      script: './src/Jobs/BuyCertificate/BuyCertificate.js',
      args: '',
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYMMDD HH',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        TZ: "Asia/Jakarta"
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: "Asia/Jakarta"
      }
    },
    {
      name: '[DEV] Payment Ebook',
      script: './src/Jobs/BuyEbook/BuyEbook.js',
      args: '',
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYMMDD HH',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        TZ: "Asia/Jakarta"
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: "Asia/Jakarta"
      }
    },
    {
      name: '[DEV] Payment EPresentasi',
      script: './src/Jobs/BuyPresentasi/BuyPresentasi.js',
      args: '',
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYMMDD HH',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        TZ: "Asia/Jakarta"
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: "Asia/Jakarta"
      }
    },
    {
      name: '[DEV] Deposit Expired',
      script: './src/Jobs/DepositExpire/DepositExpire.js',
      args: '',
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYMMDD HH',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        TZ: "Asia/Jakarta"
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: "Asia/Jakarta"
      }
    },
    {
      name: '[DEV] OTP Expired',
      script: './src/Jobs/OTPExpire/OTPExpire.js',
      args: '',
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYMMDD HH',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        TZ: "Asia/Jakarta"
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: "Asia/Jakarta"
      }
    },
    {
      name: '[DEV] Payment Profisiensi',
      script: './src/Jobs/BuyProfisiensi/BuyProfisiensi.js',
      args: '',
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYMMDD HH',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        TZ: "Asia/Jakarta"
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: "Asia/Jakarta"
      }
    },
     {
      name: '[DEV] Cron Mutasi OVO',
      script: './src/Jobs/MutasiCron/MutasiOVO.js',
      args: '',
      instances: 1,
      exec_mode: 'fork',
      log_date_format: 'YYYMMDD HH',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        TZ: "Asia/Jakarta"
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: "Asia/Jakarta"
      }
    }
  ],
  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
