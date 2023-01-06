const fs = require('fs')
const csv = require('csvtojson')

fs.readdir('data/kaggle2/stocks', function(err, files){
	main(files)
	async function main(files){
		for(let file of files){
			csv().fromFile('data/kaggle2/stocks' + file).then((jsonObj)=>{

				

			})
		}
	}
})