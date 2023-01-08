const fs = require('fs')


fs.readdir('data/stocks', function(err, files){
	main(files)
})

async function main(files){
	for(let file of files){
		let stock = await readData(file)

	}
}


function readData(file){
	return new Promise((resolve, reject)  => {
		fs.readFile('data/stocks/'+file, (err, data) => {
			if (err) throw err
			resolve(JSON.parse(data))
		})
	})
}