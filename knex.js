module.exports = require('knex')({
  client: 'pg',
  connection: 'postgresql://postgres@localhost:5432/cendana_db?schema=public'
})