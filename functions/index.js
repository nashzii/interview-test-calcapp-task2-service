const functions = require('firebase-functions');
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')

const admin = require("firebase-admin")
var serviceAccount = require('./credential/calcapp-interview-test-firebase-adminsdk-v3ncv-60d752bea6.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})
const app = express()
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json())

app.post('/save', async (req, res) => {
  const {a, b, operator, result, uid} = req.body
  fs.mkdirSync(`${__dirname}/${uid}/`, { recursive: true })
  fs.writeFileSync(`${__dirname}/${uid}/data.json`, JSON.stringify({ a, b, operator, result }))
  await admin.storage().bucket('calcapp-interview-test.appspot.com/').upload(`${__dirname}/${uid}/data.json`, {destination: `${uid}/data.json`})
  fs.rmdirSync(`${__dirname}/${uid}/`, {recursive: true})
  res.send({message: 'success'})
})

app.get('/load/:id', async (req, res) => {
  return admin.storage().bucket('calcapp-interview-test.appspot.com/').file(`${req.params.id}/data.json`).download().then(files => {
    return files.forEach(el => {
      return res.send(el.toString())
    })
  }).catch(err => {
    res.status(404).send({message: 'not found'});
    console.log(err)
  })
})

// const port = 3000
// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })


exports.api = functions.https.onRequest(app);
