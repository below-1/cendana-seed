const fs = require('fs')
const axios = require('axios')
const { parse, format } = require('date-fns')
const CsvReadableStream = require('csv-reader')
const FILENAME = './csv/purchases.csv'
const knex = require('knex')({
  client: 'pg',
  connection: 'postgresql://postgres@localhost:5432/cendana_db?schema=public'
})

const api = axios.create({
  baseURL: 'http://localhost:5000'
})

async function readData(filename) {
  let inputStream = fs.createReadStream(filename, 'utf-8')
  return new Promise((resolve, reject) => {
    const results = []
    inputStream
      .pipe(new CsvReadableStream({
        parser: true,
        trim: true
      }))
      .on('data', function (row) {
        results.push(row)
      })
      .on('error', function (err) {
        reject(err)
      })
      .on('end', function () {
        resolve(results)
      })
  })
}

async function loadSuppliers() {
  const customers = await knex.select('*').from('User').where('role', '=', 'SUPPLIER')
  return customers
}

async function loadProducts() {
  const products = await knex.from('Product')
    .select('*')
  return products
}

module.exports = async function ({ authorId }) {
  const products = await loadProducts()
  const suppliers = await loadSuppliers()
  const data = await readData(FILENAME)

  let lastTanggal
  let supplier
  let order = null
  let nominal

  for (let row of data) {
    let dateString = row[0]
    if (dateString) {
      lastTanggal = parse(dateString, 'dd-MM-yyyy', new Date())
    }

    const supplierName = row[1]
    const productName = row[2].toLowerCase()
    let product = products.find(it => it.name == productName)
    let unit = 'pcs'
    const buyPrice = parseInt(row[3].split('/')[0].replace('.', ''))
    const [ _temp1, _temp2 ] = row[4].split(' ')
    if (_temp2) {
      unit = _temp2
    }
    const quantity = parseInt(row[4])

    if (supplierName) {
      supplier = suppliers.find(c => c.name == supplierName)
      if (!supplier) {
        throw new Error(`supplier(name=${supplierName}) can't be found`)
      }
      targetUserId = supplier.id
    }

    if (order) {
      // New order, save previous order
      const currentOrderStateResponse = await api.get('/v1/api/purchases/' + order.id)
      const currentOrderState = currentOrderStateResponse.data
      // console.log(currentOrderStateResponse)
      nominal = currentOrderState.grandTotal
      // console.log(nominal)
      try {
        await api.put(`/v1/api/purchases/${order.id}/seal`, {
          authorId: 1,
          nominal,
          status: 'SUCCESS',
          paymentMethod: 'CASH'
        })
      } catch (err) {
        console.log(err)
        console.log('error sealing sale')
        process.exit(1)
      }
      // process.exit(0)
    }

    if (productName && productName != '') {
      // Create order as starting point
      // console.log(format(lastTanggal, 'yyyy-MM-dd HH:mm:ss'))
      // console.log()
      try {
        console.log(`PURCHASES: creating purchase at ${lastTanggal}`)
        const orderResponse = await api.post('/v1/api/purchases', {
          description: '',
          authorId: 1,
          targetUserId,
          createdAt: lastTanggal.toISOString()
        })
        console.log(orderResponse)
        order = orderResponse.data
      } catch (err) {
        console.log(err)
        console.log('error creating order')
        process.exit(1)
      }
    }
    if (!product) {
      console.log(`PURCHASES: creating ${productName}`)
      // process.exit(1)
      const productResponse = await api.post('/v1/api/products', {
        name: productName,
        unit,
        categories: []
      })
      product = productResponse.data
    }

    // Add order item
    console.log(`PURCHASES: add stock-item`)
    await api.post('/v1/api/stock-items', {
      orderId: order.id,
      authorId,
      productId: product.id,
      discount: 0,
      buyPrice,
      sellPrice: buyPrice + 1500,
      available: quantity,
      defect: 0,
      quantity
    })
  }
}