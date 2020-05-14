const { DATABASE } = require('@Config/Config');
const { dialect, uname, passwd, host, port, db } = DATABASE;


const knexConfig = {
    local: {
        client: dialect,
        connection: {
            host: `localhost`,
            user: uname,
            password: passwd,
            database: db
        },
        pool: { min: 0, max: 7 }
    },

    development: {
        // debug: true,
        useNullAsDefault: true,
        client: dialect,
        connection: {
            host: host,
            user: uname,
            password: passwd,
            database: db,
        },
        pool: { min: 0, max: 7 }
    },

    production: {
        client: dialect,
        connection: {
            host: `localhost`,
            user: uname,
            password: passwd,
            database: db
        },
        pool: { min: 0, max: 7 }
    }
};

module.exports = knexConfig;