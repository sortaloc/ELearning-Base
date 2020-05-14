// import knex, { Config } from 'knex';
const knex = require('knex');

const knexConfig = require('./knexFile');

const {NODE_ENV} = require('@Config/Config');

let KNEX = knex(knexConfig[NODE_ENV]);

console.log(KNEX)

module.exports = KNEX;