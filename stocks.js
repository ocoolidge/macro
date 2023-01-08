const fs = require('fs')
const yahooFinance = require('yahoo-finance')
const csv = require('csvtojson')
const sleep = require('sleep-promise')
const cluster = require('cluster');

const CSVfile = 'data/kaggle2/symbols_valid_meta.csv'
const JSONfile = 'data/kaggle2/symbols_valid_meta.json'

let date = new Date()
date.setDate(date.getDate()-3)
let year = date.getFullYear()
let month = date.getMonth()+1
let day = date.getDay()
//let day = date.getDay()


if (cluster.isMaster) {
	cluster.fork()

	cluster.on('exit', function(worker, code, signal) {
		cluster.fork()
	})
}

if (cluster.isWorker) {
	fs.readFile('data/companyList.json', (err, data) => {
		fs.readdir('data/stockInfo', function(err, files){
			let obj = JSON.parse(data)
			main(obj, files)
		})
	})

	async function main(tickers, blacklist){
		let keys = Object.keys(tickers)
		for(let i = 0; i < keys.length; i++){
			let go = true
			for(let item of blacklist){
				let lastIndex = item.lastIndexOf('.')
				item = item.slice(0, lastIndex)
				if(item == tickers[keys[i]].Symbol){
					go = false
				}
			}
			if(go){
				console.log(tickers[keys[i]].Symbol)

				let info = tickers[keys[i]]
				//let quotes = await getQuotes(tickers[keys[i]].Symbol)
				let yInfo = await getInfo(tickers[keys[i]].Symbol)

				// if(quotes.length > 0/* && !quotes.hasOwnProperty('error')*/){
				// 	console.log('SUCCESS QUOTES')
				// }
				if(!yInfo.hasOwnProperty('error')){
					console.log('SUCCESS INFO')
				}

				console.log(await updateFile(info, [], yInfo))
			}
		}
	}

	function updateFile(info, history, yInfo){
		return new Promise((resolve, reject)  => {
			fs.readFile('data/stocksInfo/'+info.Symbol+'.json', function(err, data){
				if(err){
					let toWrite = {'info':info, 'history':history}
					let yKeys = Object.keys(yInfo)
					for(let key of yKeys){
						toWrite[key] = yInfo[key]
					}
					fs.writeFile('data/stockInfo/'+(info.Symbol).toString()+'.json', JSON.stringify(toWrite, null, 4), (err) => {
						if (err){
							throw err
						}else{
							resolve((info.Symbol).toString() + '.json written')
						}
					})
				}else{
					let old = JSON.parse(data)
					let toWrite = {}
					if(history.length > 0 && !history.hasOwnProperty('error')){
						toWrite.history = history
					}else{
						toWrite.history = old.history
					}if(yInfo.summaryDetail.length > 0 && !yInfo.hasOwnProperty('error')){
						let yKeys = Object.keys(yInfo)
						for(let key of yKeys)
							toWrite[key] = yInfo[key]
					}else{
						let oldYkeys = Object.keys(old)
						for(let key of oldYkeys)
							if(key != 'info' && key != 'history')
								toWrite[key] = old[key]
					}
					fs.writeFile('data/stockiInfo/'+(info.Symbol).toString()+'.json', JSON.stringify(toWrite, null, 4), (err) => {
						if (err){
							throw err
						}else{
							resolve((info.Symbol).toString() + '.json updated')
						}
					})
				}
			})
		})
	}

	function getQuotes(symbol){
		return new Promise((resolve, reject)  => {
			yahooFinance.historical({symbol: symbol, to: date.toISOString()}, function (err, quotes) {
				if(err){
					console.log(err.name)
					console.log(err.message)
					console.log(quotes[0])
					console.log('in function (err, quotes): ' + symbol)
					resolve({'error':{'name':err.name, 'message':err.message}})
				}else{
					console.log(quotes[0])
					if(quotes.length < 1)
						sleep(4000).then(function(){resolve(quotes)})
					else
						sleep(1000).then(function(){resolve(quotes)})
				}
				console.log(quotes)
			})
		})
	}

	function getInfo(symbol){
		return new Promise((resolve, reject)  => {
			yahooFinance.quote({
				symbol: symbol,
				modules: [ 'price', 'summaryDetail', 'earnings', 'calendarEvents', 'recommendationTrend', 'defaultKeyStatistics', 'summaryProfile', 'financialData', 'upgradeDowngradeHistory' ]}, 
			function (err, info) {
				if(err){
					console.log(err.name)
					console.log(err.message)
					console.log('in function (err, quotes): ' + symbol)
					resolve({'error':{'name':err.name, 'message':err.message}})
				}else{
					if (info.summaryDetail.length < 1) 
						sleep(3000).then(function(){resolve(info)})
					else
						sleep(1000).then(function(){resolve(info)})
				}
			})
		})
	}

	
}