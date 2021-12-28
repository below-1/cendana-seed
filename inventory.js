const fs = require('fs')
const CsvReadableStream = require('csv-reader')
const FILENAME = './csv/inventory-awal.csv'
const knex = require('./knex')

function convertToObject(data) {
  let sellPrice = parseInt(data.sellPrice.replace(',', ''))
  // if (sellPrice < 4000) {
  //   sellPrice = 1000
  // }
  // console.log(data)
  return {
    // ...data,
    name: data.name.toLowerCase(),
    unit: data.unit.toLowerCase(),
    sellPrice: sellPrice,
    updatedAt:  knex.raw('CURRENT_TIMESTAMP'),
    buyPrice: parseInt(data.sellPrice.replace(',', '')) - 500,
    discount: 0,
    // supplierId: parseInt(data.supplierId),
    sold: data.sold == 'tidak ada' ? 0 : parseInt(data.sold),
    available: parseInt(data.lastQuantity),
    defect: 0,
    returned: 0
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
        console.log(err)
        reject(err)
      })
      .on('end', function () {
        resolve(results)
      })
  })
}

async function importData() {
  const data = await readData(FILENAME)
  await knex.insert(data).into("Product")
  console.log('done inserting data')
}

module.exports = importData
