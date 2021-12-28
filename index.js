const admin = require('./admin')
const inventory = require('./inventory')
const customer = require('./customer')
const supplier = require('./supplier')
const opex = require('./opex')
const sale = require('./sale')
const purchases = require('./purchase')
const equityChange = require('./equity-change')
const finance = require('./finance')
const { snapshotStart, snapshotEnd } = require('./snapshot')

async function main() {
  try {
    const currentUser = await admin()

    await inventory()
    await customer()
    await supplier()
    await equityChange({ authorId: currentUser.id })

    await snapshotStart({ authorId: currentUser.id })
    // console.log('here')
    
    await opex({ authorId: currentUser.id })
    await purchases({ authorId: currentUser.id })
    await sale({ authorId: currentUser.id })
    // console.log('and there')
    
    await snapshotEnd({ authorId: currentUser.id })
    await finance()
  } catch (err) {
    if (err.response) {
      // console.log(err.response)
      console.log(`error in ${err.response}`)
    }
    console.log('stop')
    console.log(err)
    process.exit(1)
  }
}

main()
