const fs = require('fs')
const csv = require('csvtojson')

countEmpty()

function countEmpty(){
	fs.readdir('data/stocks', async function(err, files){
		let empties = 0
		let fulls = 0
		let empty = []
		let full = []
		for(let file of files){
			if(await isEmpty(file)){
				console.log(file+ " empty")
				empty[empties] = file
				empties++
			}else{
				//console.log(file+ " full")
				full[fulls] = file
				fulls++
			}
		}
		console.log('full')
		console.log(full)
		console.log('empty')
		console.log(empty)
		console.log('full: ' + fulls)
		console.log('empty: ' + empties)
		console.log('files: ' + files.length)
	})
	function isEmpty(file){
		return new Promise((resolve, reject)  => {
			fs.readFile('data/stocks/'+file, (err, data) => {
				if (err) throw err
				data = JSON.parse(data)
				console.log(data.history.length > 0)
				if(data.history == 'empty'){
					resolve(true)
				}else if(data.history.length < 1){
					resolve(true)
				}else{
					resolve(false)
				}
			})
		})
	}
}


//makeCompanyList()
function makeCompanyList(){
	let CSVfile = 'data/kaggle2/symbols_valid_meta.csv'
	csv().fromFile(CSVfile).then((jsonObj)=>{
		let jsonVersion = {}

		for(let company of jsonObj){
			jsonVersion[company.Symbol] = company
		}
		
		fs.writeFile('data/companyList.json', JSON.stringify(jsonVersion, null, 4), (err) => {
			if (err) throw err
			console.log('The file has been saved!')
		})
	})
}


//deleteEmpty()
function deleteEmpty(){
	fs.readdir('data/stocks', async function(err, files){
		for(let file of files){
			let empty = await isFull(file)
			if(empty){
				console.log(file+ " empty")
				fs.unlink('data/stocks/'+file, (err) => {
					if(err) return console.log(err);
					console.log(file + ' file deleted successfully');
				})
			}
		}
	})
	function isFull(file){
		return new Promise((resolve, reject)  => {
			fs.readFile('data/stocks/'+file, (err, data) => {
				if (err) throw err
				data = JSON.parse(data)
				if(data.history.length > 0){
					resolve(false)
				}else{
					resolve(true)
				}
			})
		})
	}
}

