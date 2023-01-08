const axios = require('axios')
const { fstat } = require('fs')
const fs = require("fs")
const sleep = require('sleep-promise')

let list = new Array()
list.push(["GDP", "GDP"])
list.push(["PCE", "conGDP"])
list.push(["GCE", "govGDP"])
list.push(["GPDI", "invGDP"])
list.push(["EXPGS", "expGDP"])
list.push(["IMPGS", "impGDP"])
list.push(["NETEXP", "netexGDP"])
list.push(["USAGDPDEFQISMEI", "deflator"])
list.push(["POPTHM", "pop"])

list.push(["PSAVE", "persSave"])
list.push(["PSAVERT", "APS"])
list.push(["DSPI", "dispPersInc"])
list.push(["PI", "GY"])
list.push(["RPI", "Y"])
list.push(["DSPI", "GYd"])
list.push(["DPIC96", "Yd"])

list.push(["QTAXTOTALQTAXCAT1USYES", "tax"])
list.push(["GFDEBTN", "debt"])
list.push(["FEDFUNDS", "fedRate"])
list.push(["USSTHPI", "housePrice"])

list.push(["GDPC1", "realGDP"])
list.push(["GDPPOT", "realPotGDP"])
list.push(["PCEC96", "realPersCons"])
list.push(["GPDIC1", "realInv"])
list.push(["GCEC1", "realGov"])
list.push(["IMPGSC1", "realImp"])
list.push(["EXPGSC1", "realExp"])

list.push(["SP500", "sp500"])
list.push(["MORTGAGE30US", "mort"])
list.push(["NETEXC", "realNetEx"])

list.push(["W068RCQ027SBEA", "a1"])
list.push(["FGEXPND", "a2"])
list.push(["ND000342Q", "a3"])
list.push(["M2SL", "M2"])
list.push(["WM1NS", "M1"])

retrieveFred()

async function retrieveFred(){
	let output = {}

	for(let i = 0; i < list.length; i++){
		console.log(i)
		console.log(list[i])
		let series = await getSeries(list[i][0])
		let observations = await getObservations(list[i][0], series.frequency)
		series.lengthD = observations.data.length
		series.lengthL = observations.labels.length
		series.data = observations.data
		series.labels = observations.labels
		if(series.frequency.indexOf("Quarterly") > -1){
			series.frequency = series.frequency + " Changed to Monthly"
		}
		output[list[i][1]] = series
	}

	let toWrite = JSON.stringify(output, null, 4)

	fs.writeFile("data/FREDdata.json", toWrite, function(err) {
		if(err){ return console.log(err)}
		console.log("The file was saved!")
	})
}

function getSeries(id){
	return new Promise((resolve, reject)  => {
		axios.get('https://api.stlouisfed.org/fred/series?series_id='+id+'&api_key=5f11050cc1fbd2254dcee4489d8ae9fa&file_type=json')
		.catch(function (error){ if(error) {console.log("error")}})
		.then(resp => {
			resolve(resp.data.seriess[0])
		})
	})
}

function getObservations(id, frequency){
	return new Promise((resolve, reject)  => {
		axios.get('https://api.stlouisfed.org/fred/series/observations?series_id='+id+'&api_key=5f11050cc1fbd2254dcee4489d8ae9fa&file_type=json')
		.catch(function (error){ if(error) {console.log("error")}})
		.then(resp => {
			let obs = resp.data.observations
			let dataArray = new Array()
			let dateArray = new Array()

			if(frequency.indexOf("Quarterly") > -1){
				let j = 0
				for(let i = 0; i < obs.length; i++){
					let year = parseInt(obs[i].date.split('-')[0])
					let month = parseInt(obs[i].date.split('-')[1]-1)
					dataArray[j] = parseFloat(obs[i].value)
					dateArray[j] = obs[i].date
					let date = new Date(year, month+1, 1)
					dateArray[j+1] = date.getFullYear() + "-" + '0'.concat(parseInt(date.getMonth()+1).toString()).slice(-2) + "-" + 01
					date = new Date(year, month+2, 1)
					dateArray[j+2] = date.getFullYear() + "-" + '0'.concat(parseInt(date.getMonth()+1).toString()).slice(-2) + "-" + 01
					if(i < obs.length-1){
						dataArray[j+1] = parseFloat((parseFloat(obs[i].value) + ((parseFloat(obs[i+1].value) - parseFloat(obs[i].value))*(1/3))))
						dataArray[j+2] = parseFloat((parseFloat(obs[i].value) + ((parseFloat(obs[i+1].value) - parseFloat(obs[i].value))*(2/3))))
					}else{
						dataArray[j+1] = parseFloat(obs[i].value)
						dataArray[j+2] = parseFloat(obs[i].value)
					}
					j+=3
				}
			}
			
			else if(frequency.indexOf("Monthly") > -1){
				for(let i = 0; i < obs.length; i++){
					dataArray[i] = parseFloat(obs[i].value)
					dateArray[i] = obs[i].date
				}
			}
			
			else{
				for(let i = 0; i < obs.length; i++){
					dataArray[i] = parseFloat(obs[i].value)
					dateArray[i] = obs[i].date
				}
			}

			let all = {"data":dataArray, "labels":dateArray}
			resolve(all)
		})
	})
}
