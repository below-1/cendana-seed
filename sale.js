const fs = require('fs')
const axios = require('axios')
const { parse, format } = require('date-fns')
const CsvReadableStream = require('csv-reader')
const FILENAME = './csv/sales-2.csv'
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

async function createCustomer(name, address) {
  const customer = {
    name,
    address,
    role: 'CUSTOMER'
  }
  const [ { id } ] = await knex.insert(customer).into('User').returning(['id'])
  return id
}

async function loadCustomers() {
  const customers = await knex.select('*').from('User').where('role', '=', 'CUSTOMER')
  return customers
}

async function loadProducts() {
  const products = await knex.from('Product')
    .select('*')
  return products
}

module.exports = async function ({ authorId }) {
  const products = await loadProducts()
  const customers = await loadCustomers()

  const data = await readData(FILENAME)
  let lastTanggal
  let customer
  let order = null
  let nominal
  let rowIndex = 0;

  for (let row of data) {
    let dateString = row[0]
    if (dateString) {
      lastTanggal = parse(dateString, 'yyyy-MM-dd', new Date())
    }

    const productName = row[4].toLowerCase()
    const kode = row[1]
    const customerName = row[2]
    const product = products.find(it => it.name == productName)
    const quantity = parseInt(row[5])
    const sellPrice = parseInt(row[6].split('/')[0].replace('.', ''))

    if (customerName) {
      customer = customers.find(c => c.name == customerName)
      targetUserId = customer.id
    }

    if (kode && order) {
      // New order, save previous order
      const currentOrderStateResponse = await api.get('/v1/api/sales/' + order.id)
      const currentOrderState = currentOrderStateResponse.data
      // console.log(currentOrderStateResponse)
      nominal = currentOrderState.grandTotal
      // console.log(nominal)
      try {
        await api.put(`/v1/api/sales/${order.id}/seal`, {
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

    if (kode) {
      // Create order as starting point
      // console.log(format(lastTanggal, 'yyyy-MM-dd HH:mm:ss'))
      // console.log()
      try {
        // console.log(lastTanggal)
        const orderResponse = await api.post('/v1/api/sales', {
          description: '',
          authorId: 1,
          targetUserId,
          createdAt: lastTanggal.toISOString()
        })
        order = orderResponse.data
      } catch (err) {
        console.log(err)
        console.log('error creating order')
        process.exit(1)
      }
    }
    if (!product) {
      console.log(productName)
      process.exit(1)
    }

    // Add order item
    await api.post('/v1/api/order-items', {
      orderId: order.id,
      authorId,
      productId: product.id,
      quantity,
      discount: 0,
      sellPrice
    })
    rowIndex += 1;
  }

  const currentOrderStateResponse = await api.get('/v1/api/sales/' + order.id)
  const currentOrderState = currentOrderStateResponse.data
  nominal = currentOrderState.grandTotal
  await api.put(`/v1/api/sales/${order.id}/seal`, {
    authorId: 1,
    nominal,
    status: 'SUCCESS',
    paymentMethod: 'CASH'
  })
  console.log('done')
}
