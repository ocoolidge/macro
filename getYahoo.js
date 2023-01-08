const fs = require('fs')
const yahooFinance = require('yahoo-finance')
const csv = require('csvtojson')
const sleep = require('sleep-promise')
const cluster = require('cluster')
const axios = require('axios')

const CSVfile = 'data/kaggle2/symbols_valid_meta.csv'
const JSONfile = 'data/kaggle2/symbols_valid_meta.json'

let infoURL = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary/{symbol}?{modules}'
let infoModules = 'price, summaryDetail, earnings, calendarEvents, recommendationTrend, defaultKeyStatistics, summaryProfile, financialData, upgradeDowngradeHistory'
let historyURL = 'https://query1.finance.yahoo.com/v8/finance/chart/'

let date = new Date()
date.setDate(date.getDate()-1)
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
		fs.readdir('data/stocks2', function(err, files){
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
				let info = tickers[keys[i]]
				let quotes = await getQuotes(tickers[keys[i]].Symbol)
				if(quotes.length > 0 && !quotes.hasOwnProperty('error')){
					console.log('SUCCESS QUOTES')
				}
				// let yInfo = await getInfo(tickers[keys[i]].Symbol)
				// if(yInfo.summaryDetail.length > 0 && !quotes.hasOwnProperty('error')){
				// 	console.log('SUCCESS QUOTES')
				// }
				// var yKeys = Object.keys(yInfo)
				// let toWrite = {'info':info, 'history':quotes}
				// for(let key of yKeys){
				// 	toWrite[key] = yInfo[key]
				// }
				// console.log(await writeQuotes(toWrite))
			}
		}
		
	}

	function getQuotes(symbol){
		return new Promise((resolve, reject)  => {
			console.log('https://query1.finance.yahoo.com/v10/finance/quoteSummary/aapl?modules=earningsHistory')
			//axios.get(historyURL+symbol+'&interval=1D'+'&to='+date.toISOString(), function (err, priceHistory) {
				axios.get('hhttps://query1.finance.yahoo.com/v11/finance/download/AAPL', function (err, priceHistory) {
				if(err){
					console.log(err.name)
					console.log(err.message)
					console.log(priceHistory)
					console.log('in function (err, quotes): ' + symbol)
					resolve({'error':{'name':err.name, 'message':err.message}})
				}else{
					console.log(priceHistory)
				}
				console.log(priceHistory)
			})
		})
	}

	// function getQuotes(symbol){
	// 	return new Promise((resolve, reject)  => {
	// 		yahooFinance.historical({symbol: symbol, to: date, interval: '60m'}, function (err, quotes) {
	// 			if(err){
	// 				console.log(err.name)
	// 				console.log(err.message)
	// 				console.log(quotes[0])
	// 				console.log('in function (err, quotes): ' + symbol)
	// 				resolve({'error':{'name':err.name, 'message':err.message}})
	// 			}else{
	// 				if(quotes.length < 1)
	// 					sleep(4000).then(function(){resolve(quotes)})
	// 				else
	// 					sleep(1000).then(function(){resolve(quotes)})
	// 			}
	// 		})
	// 	})
	// }

	function getInfo(symbol){
		return new Promise((resolve, reject)  => {
			yahooFinance.quote({
				symbol: symbol,
				modules: [ 'price', 'summaryDetail', 'earnings', 'calendarEvents', 'recommendationTrend', 'defaultKeyStatistics', 'summaryProfile', 'financialData', 'upgradeDowngradeHistory' ]}, 
			function (err, info) {
				if(err){
					console.log(err.name)
					console.log(err.message)
					console.log(info)
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

	function writeQuotes(data){
		return new Promise((resolve, reject)  => {
			fs.writeFile('data/stocks2/'+(data.info.Symbol).toString()+'.json', JSON.stringify(data, null, 4), (err) => {
				if (err){
					throw err
				}else{
					resolve((data.info.Symbol).toString() + '.json written')
				}
			})
		})
	}
}