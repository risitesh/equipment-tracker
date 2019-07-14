var express = require('express')
const open = require('open')

var app = express()
const port = 5000
var path = require('path')

var equipmentRouter = require('./routes/equipment');

function allowCrossDomain (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
}

app.set('views', path.join(__dirname, 'views'))

app.use(allowCrossDomain)
app.use('/', express.static(`${__dirname}/public`))
app.use('/equipment', equipmentRouter)

app.listen(port, async (err) => {
  if (err) { console.error('Something bad happend', err) }

  console.log(`App running at: http://localhost:${port}`)
  await open(`http://localhost:${port}`)
})