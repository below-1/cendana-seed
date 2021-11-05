const cmd = require('node-cmd')

module.exports = () => {
  cmd.runSync('dropdb -U postgres cendana_db')
  cmd.runSync('createdb -U postgres cendana_db')
}