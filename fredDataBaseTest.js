const axios = require('Axios')
const fs = require("fs")
const sleep = require('sleep-promise')

let apiKey = '5f11050cc1fbd2254dcee4489d8ae9fa'

getSeriess(106).then(function(result){
	console.log(result)
	console.log(result.seriess.length)
	fs.writeFile('./data/FREDcategory106Seriess.json', JSON.stringify(result, null, 4), function(err){
		if(err){
			console.log(err)
		}else{
			console.log("JSON saved")
		}
	})
})


function getSeriess(id){
	return new Promise((resolve, reject) => {
		let url = 'https://api.stlouisfed.org/fred/category/series?category_id='+id+'&api_key='+apiKey+'&file_type=json'
		tryAgain2 = false
		axios.get(url).catch(function(error){
			if(error.response){
				tryAgain2 = true
			}else if(error.request){
				console.log(error.request)
				tryAgain2 = true
			}else{
				console.log('Error', error.message)
				tryAgain2 = true
			}
		}).then(resp => {
			if(!tryAgain2){
				resolve(resp.data)
			}else{
				sleep(1000).then(function(){
					resolve(getSeriess(id))
				})
			}
		})
	})
}