const admin = require('./admin')
const inventory = require('./inventory')
const customer = require('./customer')
const opex = require('./opex')
const sale = require('./sale')
const equityChange = require('./equity-change')
const { snapshotStart, snapshotEnd } = require('./snapshot')

async function main() {
  try {
    const currentUser = await admin()
    await inventory()
    await customer()

    await snapshotStart({ authorId: currentUser.id })
    await equityChange({ authorId: currentUser.id })
    
    await opex({ authorId: currentUser.id })
    await sale({ authorId: currentUser.id })
    await snapshotEnd({ authorId: currentUser.id })
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

main()
