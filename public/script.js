$(document).ready(go)
import RequestResponse from "./RequestResponse.js";

let customList = [
	["APC","Average Propensity to Consume"],
	["MPS","Marginal Propensity to Save"],
	["MPC","Marginal Propensity to Consume"],
	["C","Consumption"],
	["S","Saving"],
	["m","Marginal Propensity to Import"],
	["c","Autonomous Consumption"],
	["autoEx","Autonomous Expenditure"],
	["induEx","Induced Expenditure"],
	["AE","Aggregate Expenditure"],
	["AEper","Aggregate Expenditure per capita"],
	["t","Tax Rate"],
	["inducer","Inducer"],
	["ad","Aggregate Demand: M2/AE"],
	["deflatedM2","2012 Deflated M2"]
]

function go(){
	requestResponse('/getData', 'data', 'parseData')
	requestResponse('/getStockList', 'data', 'parseStockList')
}

function parseStockList(response){
	//console.log(response)
}

function parseData(response){
	response = addCustom(response)
	let longest = getLongest(response)
	function makeIndicators(fx, name, vars){
		let length = Infinity
		let neww = response[name]
		console.log(response[vars[0]].labels)
		for(let key of vars){
			if(response[key].data.length < length){length = response[key].data.length}
			response[key].data = response[key].data.reverse()
			response[key].labels = response[key].labels.reverse()
		}
		console.log(length)
		console.log(response.M2)
		console.log(response.deflator)
		for(let i = 0; i < length; i++){
			neww.data[i] = parseFloat(eval(fx))
			neww.labels[i] = response[vars[0]].labels[i]
		}
		console.log(neww.labels)
		for(let key of vars){
			response[key].data = response[key].data.reverse()
			response[key].labels = response[key].labels.reverse()
		}
		neww.labels = neww.labels.reverse()
		neww.data = neww.data.reverse()
		return neww
	}

	for(let i = 0; i < response.APS.data.length; i++){
		response.APS.data[i] *= .01
		response.APC.data[i] = parseFloat(1 - response.APS.data[i])
		response.APC.labels[i] = response.APS.labels[i]
	}
	
	response.deflatedM2 = makeIndicators('response.M2.data[i]/(response.deflator.data[i]/94.86331)', 'deflatedM2', ['M2', 'deflator'])
	response.t = makeIndicators('1-(response.Yd.data[i]/response.Y.data[i])', 't', ['Yd', 'Y'])
	response.C = makeIndicators('response.APC.data[i] * response.Yd.data[i]', 'C', ['APC', 'Yd'])
	response.S = makeIndicators('1-(response.Yd.data[i]/response.Y.data[i])', 'S', ['Yd', 'Y'])
	response.m = makeIndicators('response.realImp.data[i]/response.Yd.data[i]', 'm', ['realImp', 'Yd'])
	response.MPC = makeIndicators('(((response.C.data[i]-response.C.data[i+1])/(response.Yd.data[i]-response.Yd.data[i+1]))/100)+0.5', 'MPC', ['C', 'Yd'])
	response.MPS = makeIndicators('(((response.S.data[i]-response.S.data[i+1])/(response.Yd.data[i]-response.Yd.data[i+1]))/100)+0.5', 'MPS', ['S', 'Yd'])
	response.c = makeIndicators('response.C.data[i]-(response.MPC.data[i]*response.Yd.data[i])', 'c', ['C', 'MPC', 'Yd'])
	response.autoEx = makeIndicators('response.c.data[i] + response.realInv.data[i] + response.realGov.data[i] + response.realExp.data[i]', 'autoEx', ['c', 'realInv', 'realGov', 'realExp'])
	response.induEx = makeIndicators('response.Y.data[i]*((response.MPC.data[i]*(1-response.t.data[i]))-response.m.data[i])', 'induEx', ['Y', 'MPC', 't', 'm'])
	response.AE = makeIndicators('response.autoEx.data[i] + response.induEx.data[i]', 'AE', ['autoEx', 'induEx'])
	response.AEper = makeIndicators('response.AE.data[i]/(response.pop.data[i]/1000000)', 'AEper', ['AE', 'pop'])
	response.ad = makeIndicators('response.M2.data[i]/response.AE.data[i]', 'ad', ['M2', 'AE'])
	response.inducer = makeIndicators('(response.MPC.data[i]*(1-response.t.data[i]))-response.m.data[i]', 'inducer', ['MPC', 't', 'm'])
	
	for(let key of Object.keys(response)){
		console.log(key + ": " + response[key].data[response[key].data.length-1])
		console.log(key + ": " + response[key].labels[response[key].data.length-1])
	}

	console.log(response)
	console.log(longest)

	let frame = Math.max(response.inducer.data.length, response.autoEx.data.length) - Math.min(response.inducer.data.length, response.autoEx.data.length)
	doData(response, longest)

	function doData(stuff, longest){

		let equilibriumGDP = generateLine(("((" + parseFloat(stuff.inducer.data[frame]) + " * x) + " + parseFloat(stuff.autoEx.data[frame])+")").toString(), 0, 30000, 100)
		let graph = makeEquibGDPGraph('chartAnim', equilibriumGDP)
		let ctx = $('#chartAnim')
		ctx.data('chartAnim', graph)

		setInterval(AE, 100, stuff, longest)

		let labels = longest.labels
		addGraph({'y1':[stuff.M2, stuff.deflatedM2], 'y2':[stuff.realGDP, stuff.AE]})
		addGraph({'y1':[stuff.M2, stuff.deflatedM2, stuff.realGDP, stuff.AE]})
		addGraph({'y1':[stuff.ad]})
		addGraph({'A':[stuff.M2, stuff.deflatedM2]})
		addGraph({'A':[stuff.Yd, stuff.C, stuff.realPersCons, stuff.AE, stuff.realGDP]})
		addGraph({'A':[stuff.c]})
		addGraph({'A':[stuff.induEx, stuff.autoEx]})
		addGraph({'y1':[stuff.APS], 'y2':[stuff.APC], 'y3':[stuff.m]})
		addGraph({'A':[stuff.AEper]})
		addGraph({'A':[stuff.MPC, stuff.MPS]})
	}

	function AE(response, longest){
	
		frame ++
		// console.log(response.inducer.labels[frame])
		// console.log(response.autoEx.labels[frame])
		if(frame >= Math.max(response.inducer.data.length, response.autoEx.data.length)){
			frame = Math.max(response.inducer.data.length, response.autoEx.data.length) - Math.min(response.inducer.data.length, response.autoEx.data.length)
		}
	
		let equilibriumGDP = generateLine(("((" + parseFloat(response.inducer.data[frame]) + " * x) + " + parseFloat(response.autoEx.data[frame])+")").toString(), 0, 30000, 100)
		
		let text = document.getElementById("AEtext")
		text.innerHTML = longest.labels[frame]+"<br>$"+Math.trunc(equilibriumGDP.lines.x).toString() + " billion"
		+"<br>$"+Math.trunc(equilibriumGDP.lines.x/(response.pop.data[frame]/1000000)).toString() + " per person"
		+"<br>"+((Math.round(response.inducer.data[frame]*100)/100) + "x" + " + " + Math.round(response.autoEx.data[frame])).toString()
	
		var graph = $('#chartAnim').data('chartAnim')
		graph.data.labels = equilibriumGDP.xValues
		graph.data.datasets[0].data = equilibriumGDP.yValues
		graph.update()
	}
}

function prep(indicators){

	function getLongestSet(indicators){
		let keys = Object.keys(indicators)
		let longestSet = indicators[keys[0]][0]
		for(let group of keys){
			for(let set of indicators[group]){
				if(set.data.length > longestSet.data.length){
					longestSet = set
				}
			}
		}return longestSet
	}
	let longestSet = getLongestSet(indicators)
	let keys = Object.keys(indicators)
	for(let group of keys){
		for(let set of indicators[group]){
			let difference = longestSet.data.length - set.data.length
			let NaNarray = new Array()
			for(let i = 0; i < difference; i++){
				NaNarray[i] = NaN
			}
			set.data = NaNarray.concat(set.data)
			set.labels = longestSet.labels
		}
	}
	return indicators
}

function addGraph(indicators){
	
	indicators = prep(indicators)
	let config = makeConfig(indicators[Object.keys(indicators)[0]][0].labels)
	let sets = new Array()
	let counter = 0

	for(let key of Object.keys(indicators)){
		config.options.scales[key] = {'type':'linear', 'position':'left'}
		//config.options.scales[y1] = {'type':'linear', 'position':'left'}
		if(counter > 0){
			config.options.scales.yAxes.push({
				ticks: {
					maxTicksLimit: 20,
					userCallback: function(item) {
						return (item).toString()// + " " + (unit!=undefined?unit:"")
					}
				}, 
				id: key,
				position: 'left'
			})
		}
		for(let set of indicators[key]){
			sets.push(makeSet(set.data, set.title + " " + set.units, key))
		}
		counter++
	}
	config.options.scales.yAxes[0].id = 'A'
	config.data.datasets = sets
	let element = document.getElementById("graphs")
	let canvasas = element.querySelectorAll("canvas")
	let canvas = document.createElement("canvas")
	canvas.id = (canvasas.length+1).toString()
	element.appendChild(canvas)
	var ctx = document.getElementById((canvasas.length+1).toString()).getContext('2d')
	var myChart = new Chart(ctx, config)
}

function makeConfig(labels){
	var config = {
		type: "line",
		data: {labels: labels, datasets: []},
		options: {
			scales: {
				xAxes: [{ticks: {maxTicksLimit: 30}}],
				yAxes: [{
					// ticks: {
					// 	maxTicksLimit: 20,
					// 	userCallback: function(item) {
					// 		return (item).toString()// + " " + (unit!=undefined?unit:"")
					// 	}
					// }, 
					// id: 'A', 
					// position: 'left',
				}]
			}
		}
	}
	// let ids = ['B', 'C', 'D', 'E', 'F']
	// for(let i = 0; i < numGroups-1; i++){
	// 	config.options.scales.yAxes.push({
	// 		ticks: {
	// 			maxTicksLimit: 20,
	// 			userCallback: function(item) {
	// 				return (item/scaler).toString() + " " + (unit!=undefined?unit:"")
	// 			}
	// 		}, 
	// 		id: ids[i], 
	// 		position: 'left'
	// 	})
	// }
	return config
}

function makeSet(data, label, axisID){
	let r = Math.floor(Math.random()*256)
	let g = Math.floor(Math.random()*256)
	let b = Math.floor(Math.random()*256)
	let set = {
		label: label,
		data: data,
		backgroundColor: "rgba("+r+", "+g+", "+b+", 0.2)",
		borderColor: "rgba("+r+", "+g+", "+b+", 1)",
		borderWidth: 1,
		pointRadius: 0.2,
		yAxesID: axisID,
		fill: false,
		lineTension: 0
	}
	return set
}

function generateLine(value, i1, i2, step = 1) {
	var xValues = []
	var yValues = []
	var yValues2 = []
	for (let x = i1; x <= i2; x += step) {
		yValues.push(eval(value))
		xValues.push(x)
		yValues2.push(x)
	}
	let x = 100
	let x1 = 100
	let y1 = eval(value)
	x = 100000
	let x2 = 100000
	let y2 = eval(value)
	let x3 = 0
	let y3 = 0
	let x4 = 100000
	let y4 = 100000
	let intersectingLines = line_intersect(x1, y1, x2, y2, x3, y3, x4, y4)
	return {'xValues':xValues, 'yValues':yValues, 'yValues2':yValues2, 'lines':intersectingLines}
}

function makeEquibGDPGraph(ctx, data){
	let aChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: data.xValues,
			datasets: [{
				label: 'AE',
				fill: false,
				pointRadius: 1,
				borderColor: "rgba(255,0,0,0.5)",
				data: data.yValues
				},{
				label: "45 degree",
				fill: false,
				pointRadius: 1,
				borderColor: "rgba(0,0,255,0.5)",
				data: data.yValues2
			}
		]
		},
		options: {
			title:{
				text:"Equilibrium Real GDP",
				display:true
			},
			legend:{
				display:false
			},
			layout:{
				autoPadding:false
			},
			aspectRatio: 1,
			animation: false,
			scales: {
				xAxes: [{
					ticks: {
						display: true,
						fontSize: 12,
						maxTicksLimit: 7,
                		stepSize: 5000,
						min: 0,
						max: 40
					},
					gridLines: {
						display: true,
						drawBorder: false,
					}
				}],
				yAxes: [{
					ticks: {
						precision: 0,
						maxTicksLimit: 8,
                		stepSize: 5000,
						display: true,
						fontSize: 12,
						min: 0,
						max: 30000
					},
					gridLines: {
						display: true,
						drawBorder: true,
					}
				}]
			}
		}
	})
	return aChart
}

function line_intersect(x1, y1, x2, y2, x3, y3, x4, y4){
	var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
	if (denom == 0) {
		return null;
	}
	ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
	ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
	return {
		x: x1 + ua * (x2 - x1),
		y: y1 + ua * (y2 - y1),
		seg1: ua >= 0 && ua <= 1,
		seg2: ub >= 0 && ub <= 1
	}
}

function getLongest(response){
	let longest = response.Y
	for(let key of Object.keys(response)){
		if(response[key].lengthD > longest.lengthD && key != 'realPotGDP' && key != 'mort' && key != 'sp500' && key != 'M1'){
			longest = response[key]
		}
	}
	return longest
}

function addCustom(response){
	for(let i = 0; i < customList.length; i++){
		response[customList[i][0]] = {}
		response[customList[i][0]].title = customList[i][1]
		response[customList[i][0]].data = new Array()
		response[customList[i][0]].labels = new Array()
	}
	return response
}

function requestResponse(url, data, doWith){
	console.log("in getGraphData()")
	$.ajax({
		type: "POST",
		data: JSON.stringify({clientPhrase:data}),
		url: url,
		processData: false,
		contentType: "application/json",
		cache: false,
		timeout: 600000,
		success: function (response) {
			console.log("we had success!")
			console.log(response)
			eval(doWith+'(response)')
		},
		error:function(e){
			console.log(e)
			console.log("error occurred")
		}
	})
}