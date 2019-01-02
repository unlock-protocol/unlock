const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const tokenMiddleware = require('./token_middleware')
const Lock = require('./sequelize')

const app = express()
const router = express.Router()

router
  .route('/lock')
  .put(function(req, res) {
    let newAddress = req.body.address
    let tempAddress = req.body.currentAddress

    if (tempAddress && newAddress) {
      Lock.findOne({
        where: { address: tempAddress, owner: req.owner },
        raw: true,
      })
        .then(result => {
          result.address = newAddress
          Lock.create(result).then(() => {
            res.sendStatus(202)
          })
        })
        .catch(() => {
          res.sendStatus(412)
        })
    } else {
      res.sendStatus(428)
    }
  })
  .post(function(req, res) {
    let lock = req.body
    if (lock.address && lock.name) {
      Lock.create({
        name: lock.name,
        address: lock.address,
        owner: req.owner,
      }).then(() => {
        res.sendStatus(200)
      })
    } else {
      res.sendStatus(400)
    }
  })

router.get('/lock/:lockAddress', function(req, res) {
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
app.use(/^\/lock$/i, tokenMiddleware)
app.use('/', router)

module.exports = app
