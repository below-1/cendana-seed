const fs = require('fs')
const knex = require('./knex')

module.exports = async ({ authorId }) => {
  await knex.insert({
    id: 1,
    user: 'Admin Zero',
    createdAt: '2015-01-14'
  }).into('EquityChange')
  await knex.insert({
    createdAt: '2015-01-14',
    updatedAt: '2015-01-14',
    authorId,
    type: 'CREDIT',
    status: 'SUCCESS',
    paymentMethod: 'ONLINE',
    nominal: 50000000,
    description: 'Penambahan modal',
    equityChangeId: 1
  }).into('Transaction')
  
}
