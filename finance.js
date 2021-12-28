const axios = require('axios')
const api = axios.create({
  baseURL: 'http://localhost:5000'
})

module.exports = async function () {
    await api.post('/v1/api/finance/report', {
      month: 0,
      year: 2021,
      pajak: '54000'
    })
}