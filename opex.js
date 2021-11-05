const fs = require('fs')
const { parse, format } = require('date-fns')
const _ = require('lodash')
const CsvReadableStream = require('csv-reader')
const FILENAME = './csv/opex.csv'
const knex = require('./knex')

function convertToObject(data) {
  return data
}

async function readData(filename) {
  let inputStream = fs.createReadStream(filename, 'utf-8')
  return new Promise((resolve, reject) => {
    const results = []
    inputStream
      .pipe(new CsvReadableStream({
        asObject: true,
        parser: true,
        trim: true
      }))
      .on('data', function (row) {
        results.push(convertToObject(row))
      })
      .on('error', function (err) {
        reject(err)
      })
      .on('end', function () {
        resolve(results)
      })
  })
}

module.exports = async function ({ authorId }) {
  try {
    const data = await readData(FILENAME)
    const kategori = _.uniq(data.map(d => d.kategori)).map((k, index) => ({
      title: k,
      description: '',
      id: index + 1,
      updatedAt: (new Date()).toISOString(),
      createdAt: (new Date()).toISOString()
    }))
    const opTrans = data.map(d => {
      const opex = kategori.find(k => k.title == d.kategori)
      const opId = opex.id
      const createdAt = parse(d.tanggal, 'MM/dd/yy', new Date()).toISOString()
      console.log(createdAt)
      return {
        authorId,
        opexId: opId,
        nominal: parseInt(d.nominal.replace(',', '')),
        type: 'CREDIT',
        paymentMethod: 'OFFLINE',
        status: 'SUCCESS',
        createdAt,
        updatedAt: createdAt
      }
    })
    try {
      await knex.table('Transaction').where('opexId', '>', 0).del()
      await knex.table('Opex').del()
      await knex.insert(kategori).into("Opex")
      await knex.insert(opTrans).into("Transaction")
      // await knex.insert(data).into("User")
      console.log('opTrans.length = ', opTrans.length)
      console.log('done inserting data')
    } catch (err) {
      console.log(err)
      console.log('Fail insert data to PG')
    }
  } catch (err) {
    console.log(err)
  }
}
