const axios = require('Axios')
const fs = require("fs")
const sleep = require('sleep-promise')

let apiKey = '5f11050cc1fbd2254dcee4489d8ae9fa'
let categoryID = 0
let root = 0
let name = "All"

let rootCategory = 'https://api.stlouisfed.org/fred/category?category_id='+categoryID+'&api_key='+apiKey+'&file_type=json'
let childCategories = 'https://api.stlouisfed.org/fred/category/children?category_id='+categoryID+'&api_key='+apiKey+'&file_type=json'
let seriesInCategory = 'https://api.stlouisfed.org/fred/category/series?category_id='+categoryID+'&api_key='+apiKey+'&file_type=json'
let overRateLimit = false

traverse(root, name).then(function(){

})

async function traverse(id, name){
	let categoryData = {}
	categoryData[name] = {}
	let seriess = await getSeriess(id)
	let categories = await getChildCategories(id)
	console.log(seriess)
	console.log(categories)
	if(seriess == "error"){
		console.log("-----------BLOCKED----------------")
		await sleep(60000)
		seriess = await getSeriess(id)
	}else if(categories == "error"){
		console.log("-----------BLOCKED----------------")
		await sleep(60000)
		categories = await getChildCategories(id)
	}else{
		console.log(name)
		if(categories.length > 0){
			for (let category of categories){
				categoryData[name][category.id.toString()] = category.name
			}
		}
		if(seriess.length > 0){
			for(let series of seriess){
				categoryData[name][series.title] = {}
				categoryData[name][series.title].id = series.id
				categoryData[name][series.title].start = series.observation_start
				categoryData[name][series.title].end = series.observation_end
				categoryData[name][series.title].frequency = series.frequency_short
				categoryData[name][series.title].units = series.units_short
				categoryData[name][series.title].popularity = series.popularity
				categoryData[name][series.title].data = await getObservations(series.id)
				if(categoryData[name][series.title].data == 'error'){
					console.log("-----------BLOCKED----------------")
					await sleep(60000)
					categoryData[name][series.title].data = await getObservations(series.id)
				}
			}
		}
		if(categories.length > 0){
			for (let category of categories){
				traverse(category.id, category.name)
			}
		}
		fs.writeFile('data/'+name+'.json', JSON.stringify(categoryData, null, 4), function(err){
			if(err){
				console.log(err)
			}else{
				console.log("JSON saved to " + 'data/'+name+'.json')
			}
		})
	}
}

function getChildCategories(id){
	return new Promise((resolve, reject) => {
		let url = 'https://api.stlouisfed.org/fred/category/children?category_id='+id+'&api_key='+apiKey+'&file_type=json'
		overRateLimit = false
		axios.get(url).catch(function (error){
			if(error.response){
				tooManyRequests = true
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				console.log("2xx")
				overRateLimit = true
			}else if(error.request){
				// The request was made but no response was received
				console.log(error.request)
			}else{
				// Something happened in setting up the request that triggered an Error
				console.log('Error', error.message)
			}
		}).then(resp => {
			if(!overRateLimit){
				resolve(resp.data.categories)
			}else{
				resolve("error")
			}
		})
	})
}

function getSeriess(id){
	return new Promise((resolve, reject) => {
		let url = 'https://api.stlouisfed.org/fred/category/series?category_id='+id+'&api_key='+apiKey+'&file_type=json'
		overRateLimit = false
		axios.get(url).catch(function(error){
			if(error.response){
				tooManyRequests = true
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				console.log("2xx")
				overRateLimit = true
			}else if(error.request){
				// The request was made but no response was received
				console.log(error.request)
			}else{
				// Something happened in setting up the request that triggered an Error
				console.log('Error', error.message)
			}
		}).then(resp => {
			if(!overRateLimit){
				resolve(resp.data.seriess)
			}else{
				resolve("error")
			}
		})
	})
}

function getObservations(id){
	return new Promise((resolve, reject) => {
		let url = 'https://api.stlouisfed.org/fred/series/observations?series_id='+id+'&api_key='+apiKey+'&file_type=json'
		overRateLimit = false
		axios.get(url).catch(function (error) {
			if(error.response){
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				console.log("2xx")
				overRateLimit = true
			}else if(error.request){
				// The request was made but no response was received
			}else {
				// Something happened in setting up the request that triggered an Error
				console.log('Error', error.message)
			}
		}).then(resp => {
			if(!overRateLimit){
				resolve(resp.data.observations)
			}else{
				resolve("error")
			}
		})
	})
}