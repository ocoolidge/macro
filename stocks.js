const fs = require('fs')
const yahooFinance = require('yahoo-finance')
const csv = require('csvtojson')
const sleep = require('sleep-promise')

const CSVfile = 'data/kaggle2/symbols_valid_meta.csv'
const JSONfile = 'data/kaggle2/symbols_valid_meta.json'

let date = new Date()
let year = date.getFullYear()
let month = date.getMonth()+1
date.setDate(date.getDate()-1)
let day = date.getDay()
//let day = date.getDay()

csv().fromFile(CSVfile).then((jsonObj)=>{

	fs.readdir('data/stocks', function(err, files){
		main(jsonObj, files)
	})

})

async function main(tickers, blacklist){
	
	for(let i = 37; i < tickers.length; i++){
		let go = true
		for(let item of blacklist){
			let lastIndex = item.lastIndexOf('.')
			item = item.slice(0, lastIndex)
			// if(item.indexOf('_') > -1){
			// 	item = item.split('_')[0]+'.json'
			// }
			if(item == tickers[i].Symbol){
				go = false
			}
		}
		if(go){
			let info = tickers[i]
			let quotes = await getQuotes(tickers[i].Symbol)
			if(quotes.hasOwnProperty('error')){
				info.dataRequest = "_ERROR"
				let toWrite = {'info':info, 'history':null, 'error':quotes}
				console.log(await writeQuotes(toWrite))
			}else{
				if(quotes.length < 1){
					console.log(tickers[i].symbol + " EMPTY SET")
					info.dataRequest = ""
					let toWrite = {'info':info, 'history':quotes}
					console.log(await writeQuotes(toWrite))
				}else{
					console.log("SUCCESS")
					info.dataRequest = ""
					let toWrite = {'info':info, 'history':quotes}
					console.log(await writeQuotes(toWrite))
				}
			}
		}
	}
	
}

function getQuotes(symbol){
	return new Promise((resolve, reject)  => {
		try {
			yahooFinance.historical({symbol: symbol, to: (year+'-'+month+'-'+day).toString()}, function (err, quotes) {
				try{
					if(err){
						console.log(err.name)
						console.log(err.message)
						console.log(quotes[0])
						console.log('in function (err, quotes): ' + symbol)
						resolve({'error':{'name':err.name, 'message':err.message}})
					}else{
						if(quotes.length < 1){
							sleep(4000).then(function(){
								resolve(quotes)
							})
						}else{
							sleep(1000).then(function(){
								resolve(quotes)
							})
						}
					}
				}catch(error){
					console.log(error.message)
					console.log('caught')
				}
			})
		}catch(error){
			console.log('after catch: ' + symbol)
			console.log(symbol + " ERROR")
			resolve({'error':{'name':error.name, 'message':error.message}})
		}
	})
}

function writeQuotes(data){
	//console.log(data)
	return new Promise((resolve, reject)  => {
		fs.writeFile('data/stocks/'+(data.info.dataRequest + data.info.Symbol).toString()+'.json', JSON.stringify(data, null, 4), (err) => {
			if (err){
				//resolve(false)
				throw err
			}
			resolve((data.info.dataRequest + data.info.Symbol).toString() + '.json written')
		})
	})
}