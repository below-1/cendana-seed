const fs = require('fs')
const CsvReadableStream = require('csv-reader')
const FILENAME = './csv/customers.csv'
const knex = require('./knex')

function convertToObject(data) {
  return {
    // ...data,
    name: data.name,
    address: data.address,
    role: 'CUSTOMER'
  }
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

async function importData() {
  try {
    const data = await readData(FILENAME)
    try {
      await knex.insert(data).into("User")
      console.log('done inserting data')
    } catch (err) {
      console.log(err)
      console.log('Fail insert data to PG')
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = importData
