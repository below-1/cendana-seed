const fs = require('fs')
const knex = require('./knex')

module.exports = async ({ authorId }) => {
  const initialAmount = 50000000
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
    nominal: initialAmount,
    description: 'Penambahan modal',
    equityChangeId: 1
  }).into('Transaction')
  await knex.insert({
    createdAt: '2015-01-15',
    nominal: initialAmount
  }).into('RecordEquity')
}
