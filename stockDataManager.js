const fs = require('fs')
const csv = require('csvtojson')
const _ = require('lodash')


//countEmpty()
//makeCompanyList()
deleteEmpty()
//combine()
function combine(){
	fs.readdir('data/kaggle1/Stocks', function(err, files2){
		if (err) throw err
		let in2 = new Array()
		for(let file of files2){
			in2.push(file.split('.')[0].toUpperCase())
		}
		fs.readdir('data/kaggle2/stocks', function(err, files1){
			if (err) throw err
			let in1 = new Array()
			for(let file of files1){
				in1.push(file.split('.')[0])
			}
			let all = _.union(in1, in2)
			let onlyIn2 = new Array()
			for(let a2 of in2){
				let inBoth = false
				for(let a1 of in1){
					if(a1 == a2){
						inBoth = true
					}
				}
				if(!inBoth){
					onlyIn2.push(a2)
				}
			}
			fs.readFile('data/companyList.json', (err, list) => {
				if (err) throw err
				let parsed = JSON.parse(list)
				for(let item of onlyIn2){
					parsed[item] = {}
				}
				fs.writeFile('data/companyList.json', JSON.stringify(parsed, null, 4), (err) => {
					if (err) throw err
					console.log('The file has been saved!')
				})
			})
		})
	})
}



function countEmpty(){
	fs.readdir('data/stocks', async function(err, files){
		let empties = 0
		let fulls = 0
		let empty = []
		let full = []
		for(let file of files){
			if(await isEmpty(file)){
				console.log(file + " empty")
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
			fs.readFile('data/stocks/' + file, (err, data) => {
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



function deleteEmpty(){
	fs.readdir('data/stocks', async function(err, files){
		for(let file of files){
			let full = await isFull(file)
			if(!full){
				console.log(file + " empty")
				fs.unlink('data/stocks/' + file, (err) => {
					if(err) return console.log(err)
					console.log(file + ' file deleted successfully')
				})
			}
		}
	})
	function isFull(file){
		return new Promise((resolve, reject)  => {
			fs.readFile('data/stocks/'+file, (err, data) => {
				if (err) throw err
				data = JSON.parse(data)
				if(data.history == 'empty'){
					resolve(false)
				}else if(data.history.length < 1){
					resolve(false)
				}else{
					resolve(true)
				}
			})
		})
	}
}

