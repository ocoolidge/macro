const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const fs = require("fs")
const axios = require('axios')
const xml = require('xml')

const portNumber = 4000
let app = express()

app.use(express.static(__dirname + '/public'))
app.get('/macroOld', function(req, res) { res.sendFile(__dirname + '/public/macro.html') })
// app.get('/macro', function(req, res) { res.sendFile(__dirname + '/public/index.html') })
// app.get('/', function(req, res){ res.send('<h1>Electric Pit Bike Dot Com</h1>') })

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

let httpServer = http.createServer(app)
httpServer.listen(portNumber, function(){ console.log('listening on port:: ' + portNumber) })

const apiKey = '5f11050cc1fbd2254dcee4489d8ae9fa'

app.post('/getTopCategories', getTopCategories)
app.post('/getSubCategories', getSubCategories)
app.post('/getSeriess', getSeriess)

let topCategories = [[32991, 'Money, Banking, & Finance'], [10, 'Population, Employment, & Labor Markets'],
[32992, 'National Accounts'], [1, 'Production & Business Activity'], [32455, 'Prices'], [32263, 'International Data'],
[3008, 'U.S. Regional Data'], [33060, 'Academic Data']]

async function getTopCategories(request, response){ 
	let arr = []
	for(let i = 0; i < topCategories.length; i++){
		let cat = await requestFred('category?category_id=' + topCategories[i][0] + '&api_key=' + apiKey + '&file_type=json')
		arr.push(cat['categories'][0])
	}
	response.send(JSON.stringify(arr))
}

async function getSubCategories(request, response){
	let subCats = await requestFred('category/children?category_id=' + request.body.clientPhrase + '&api_key=' + apiKey + '&file_type=json')
	response.send(JSON.stringify(subCats['categories']))
}

async function getSeriess(request, response){
	let seriess = await requestFred('category/series?category_id=' + request.body.clientPhrase + '&api_key=' + apiKey + '&file_type=json')
	console.log(seriess)
	response.send(JSON.stringify(seriess))
}

function requestFred(options){
	return new Promise((resolve, reject)  => {
		axios.get('https://api.stlouisfed.org/fred/'+options).then(function(result){
			resolve(result.data)
		})
	})
}