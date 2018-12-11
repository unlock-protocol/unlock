const express = require('express')
var cors = require('cors');
var bodyParser = require('body-parser');
const models = require('./models')
const app = express()
const Lock = require('./sequelize')

var router = express.Router();

router.route('/lock').put(function (req, res, next) {
    let newAddress = req.body.address;
    let tempAddress = req.body.currentAddress;

    if (tempAddress && newAddress) {
        Lock.update({ address: newAddress }, {
            where: {
                address: tempAddress
            }
        }).then(result => {
            if (result[0] == 0) {
                res.sendStatus(412)
            } else {
                res.send("updated")
            }
        })
    } else {
        res.sendStatus(200) 
    }
}).post(function (req, res, next) {
    let lock = req.body
    if(lock.address && lock.name){
        Lock.create({ name: lock.name, address: lock.address }).then(result => {
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
                name: lock.name
            })
        }
    })
})

app.use(cors());
app.use(bodyParser.json());
app.use('/', router)

module.exports = app