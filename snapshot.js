const fs = require('fs')
const CsvReadableStream = require('csv-reader')
const axios = require('axios')

module.exports = {
  snapshotStart: async ({ authorId }) => {
    await axios.post('http://localhost:5000/v1/api/finance/snapshot', {}, {
      params: {
        target: '2021-01-01'
      }
    })
  },
  snapshotEnd: async ({ authorId }) => {
    await axios.post('http://localhost:5000/v1/api/finance/snapshot', {}, {
      params: {
        target: '2021-01-31'
      }
    })
  }
}
