const axios = require('Axios')
const fs = require("fs")
const sleep = require('sleep-promise')

let apiKey = '5f11050cc1fbd2254dcee4489d8ae9fa'
let rootId = 0
let dir = "all2/"
let tryAgain1 = false
let tryAgain2 = false
let recurseCount = 0

traverse(rootId, dir)

function traverse(id, dir){
	fs.access('./data/' + dir, async function(error){
		if(error){
			await fs.promises.mkdir('./data/' + dir)
		}
		fs.access('./data/' + dir + 'seriess' + '.json', async function(error){
			if(error){
				let categoryData = {}
				categoryData[id] = await getSeriess(id)
				await writeSeriesFile('seriess', categoryData[id], dir)
			}
			let categories = await getChildCategories(id)
			if(categories.length > 0){
				let traverseCount = 0
				for(let category of categories){
					console.log(recurseCount)
					traverse(category.id, dir+category.name+'/')
					recurseCount++
					traverseCount++
					if(traverseCount == categories.length-1){
						console.log(dir)
					}
				}
			}
		})
	})
}

function getChildCategories(id){
	return new Promise((resolve, reject) => {
		let url = 'https://api.stlouisfed.org/fred/category/children?category_id='+id+'&api_key='+apiKey+'&file_type=json'
		tryAgain1 = false
		axios.get(url).catch(function (error){
			if(error.response){
				tryAgain1 = true
			}else if(error.request){
				console.log('error2')
				tryAgain1 = true
			}else{
				console.log('error 2')
				tryAgain1 = true
			}
		}).then(resp => {
			if(!tryAgain1){
				let categories = resp.data.categories
				if(categories.length > 0){
					for(let category of categories){
						let name = category.name
						if(name.includes('/')){
							let subDir = name.replaceAll('/', '&')
							category.name = subDir
						}
					}
				}
				resolve(categories)
			}else{
				sleep(5000).then(function(){
					//console.log("blocked")
					resolve(getChildCategories(id))
				})
			}
		})
	})
}

function getSeriess(id){
	return new Promise((resolve, reject) => {
		let url = 'https://api.stlouisfed.org/fred/category/series?category_id='+id+'&api_key='+apiKey+'&file_type=json'
		tryAgain2 = false
		axios.get(url).catch(function(error){
			if(error.response){
				tryAgain2 = true
			}else if(error.request){
				console.log('error 2')
				tryAgain2 = true
			}else{
				console.log('error 3')
				tryAgain2 = true
			}
		}).then(resp => {
			if(!tryAgain2){
				if(resp.data.seriess.length > 0){
					let seriessData = {}
					for(let series of resp.data.seriess){
						seriessData[series.id] = {}
						seriessData[series.id].title = series.title
						seriessData[series.id].start = series.observation_start
						seriessData[series.id].end = series.observation_end
						seriessData[series.id].frequency = series.frequency
						seriessData[series.id].units = series.units
						seriessData[series.id].popularity = series.popularity
					}
					resolve(seriessData)
				}else{
					let seriessData = {}
					seriessData["none"] = {}
					resolve(seriessData)
				}
			}else{
				sleep(5000).then(function(){
					//console.log("blocked")
					resolve(getSeriess(id))
				})
			}
		})
	})
}

function writeSeriesFile(name, data, directory){
	return new Promise((resolve, reject) => {
		fs.writeFile('data/' + directory + name + '.json', JSON.stringify(data, null, 4), function(err){
			if(err){
				console.log(err)
			}else{
				//console.log("JSON saved to " + 'data/' + directory + name + '.json')
				resolve(true)
			}
		})
	})
}