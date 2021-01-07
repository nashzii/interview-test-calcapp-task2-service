const functions = require('firebase-functions');
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')({origin: true});
const fs = require('fs')

const app = express()
const router = express.Router();

app.use(bodyParser.json())
app.use(cors);

const admin = require("firebase-admin")
var serviceAccount = require('./credential/calcapp-interview-test-firebase-adminsdk-v3ncv-60d752bea6.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})


router.post('/save', async (req, res) => {
  const {a, b, operator, result, uid} = req.body
  fs.mkdirSync(`/tmp/${uid}/`, { recursive: true })
  fs.writeFileSync(`/tmp/${uid}/data.json`, JSON.stringify({ a, b, operator, result }))
  await admin.storage().bucket('calcapp-interview-test.appspot.com/').upload(`/tmp/${uid}/data.json`, {destination: `${uid}/data.json`})
  fs.rmdirSync(`/tmp/${uid}/`, {recursive: true})
  res.send({message: 'success'})
})

router.get('/load/:id', async (req, res) => {
  return admin.storage().bucket('calcapp-interview-test.appspot.com/').file(`${req.params.id}/data.json`).download().then(files => {
    return files.forEach(el => {
      return res.send(el.toString())
    })
  }).catch(err => {
    res.status(200).send({message: 'not found'});
    console.log(err)
  })
})
app.use('/api', router);

exports.api = functions.https.onRequest(app);
