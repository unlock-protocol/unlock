const express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')

const app = express()
const Lock = require('./sequelize')

var router = express.Router()

router.route('/lock').put(function (req, res) {
  let newAddress = req.body.address
  let tempAddress = req.body.currentAddress

  if (tempAddress && newAddress) {
    Lock.findOne({ where: { address: tempAddress}, raw: true}).then( (result) => {
      result.address = newAddress
      Lock.create(result)
    }).then(() => { res.sendStatus(200) })
  }
}).post(function (req, res) {
  let lock = req.body
  if(lock.address && lock.name){
    Lock.create({ name: lock.name, address: lock.address }).then(() => {
      res.sendStatus(200)
    })
  } else {
    res.sendStatus(400)
  }
})

router.get('/lock/:lockAddress', function (req, res) {
  Lock.findOne({ where: { address: req.params.lockAddress } }).then(lock => {
    if (lock == null) {
      res.sendStatus(404)
    } else {
      res.json({
        name: lock.name,
      })
    }
  })
})

app.use(cors())
app.use(bodyParser.json())
app.use('/', router)

module.exports = app
