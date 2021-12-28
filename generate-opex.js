const fs = require('fs')
const _ = require('lodash')
const ObjectsToCsv = require('objects-to-csv');
const lastDayOfMonth = require('date-fns/lastDayOfMonth')
const format = require('date-fns/format')
const Chance = require('chance')
const chance = new Chance()

const year = 2018

function randomDate({ year, month }) {
  const d = chance.date({ year, month })
  return d
}

const N_RUN = 12

let results = []
_.range(N_RUN).forEach(i => {

  _.range(8).forEach(j => {
    const row = {
      kategori: 'Pembayaran Bensin Kendaraan',
      date: randomDate({ year, month: i }),
      nominal: 800000
    }
    results.push(row)
  })

  results.push({
    kategori: 'Service Kendaraan',
    date: randomDate({ year, month: i }),
    nominal: 185000
  })

  results.push({
    kategori: 'Lainnya',
    date: randomDate({ year, month: i }),
    nominal: 250000
  })
  results.push({
    kategori: 'Lainnya',
    date: randomDate({ year, month: i }),
    nominal: 120000,
    keterangan: 'KIR'
  })
  results.push({
    kategori: 'Lainnya',
    date: randomDate({ year, month: i }),
    nominal: 400000,
    keterangan: 'Listrik'
  })
  results.push({
    kategori: 'Indihome',
    date: randomDate({ year, month: i }),
    nominal: 420000,
    keterangan: ''
  })
  results.push({
    kategori: 'Gaji Pegawai',
    date: randomDate({ year, month: i }),
    nominal: (chance.integer({ min: 0, max: 5 }) * 100000) + 2000000
  })
})

results = _.sortBy(results, it => it.date)
results = results.map(it => {
  return {
    ...it,
    date: format(it.date, 'yyyy-MMMM-dd')
  }
});
console.log(results);

(async () => {
  const csv = new ObjectsToCsv(results);
 
  // Save to file:
  try {
    await csv.toDisk('opex-out.csv');
  } catch (err) {
    console.log(err)
  }
  // console.log('done')
 
  // Return the CSV file as string:
  // console.log(await csv.toString());
})();

