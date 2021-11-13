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
    await equityChange({ authorId: currentUser.id })

    await snapshotStart({ authorId: currentUser.id })
    // console.log('here')
    
    await opex({ authorId: currentUser.id })
    await sale({ authorId: currentUser.id })
    await snapshotEnd({ authorId: currentUser.id })
  } catch (err) {
    if (err.response) {
      console.log(err.response)
      // console.log(`error in ${err.response}`)
    }
    process.exit(1)
  }
}

main()
