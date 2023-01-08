const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const fs = require("fs")

const portNumber = 4005

let app = express()

app.use(express.static(__dirname + '/public'))

app.get('/gross', function(req, res) {
    res.sendFile(__dirname + '/public/html/gross.html')
})

app.get('/macro', function(req, res) {
    res.sendFile(__dirname + '/public/macro.html')
})

app.get('/', function(req, res){
    res.send('<h1>Hello world</h1>')
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

let httpServer = http.createServer(app)

httpServer.listen(portNumber, function(){
  	console.log('listening on port:: ' + portNumber)
})

app.post('/getData', readData)
app.post('/getStockList', getStockList)

function readData(request, response){
	fs.readFile('data/FREDdata.json', 'utf8', function (err, data) {
		if (err) throw err
		response.send(JSON.parse(data))
	})
}

function getStockList(request, response){
	fs.readFile('data/companyList.json', 'utf8', function (err, data) {
		if (err) throw err
		response.send(JSON.parse(data))
	})
}