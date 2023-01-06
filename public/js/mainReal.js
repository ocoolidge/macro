$(document).ready(go)

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
	["inducer","Inducer"]
]

function go(){
	getGDPData()
	function getGDPData(){
		console.log("in getGraphData()")
		let mData = {clientPhrase:"stocks"}
		$.ajax({
			type: "POST",
			data: JSON.stringify(mData),
			url:'/getData',
			processData: false,
			contentType: "application/json",
			cache: false,
			timeout: 600000,
			success: function (response) {
				console.log("we had success!")
				parseData(response)
			},
			error:function(e){
				console.log(e)
				console.log("error occurred")
			}
		}
	)}
}

function parseData(response){
	function getLongest(){
		let longest = response.Y
		for(let key of Object.keys(response)){
			if(response[key].lengthD > longest.lengthD && key != 'realPotGDP' && key != 'mort' && key != 'sp500'){
				longest = response[key]
			}
		}
		return longest
	}

	let longest = getLongest()
	console.log(longest)

	for(let i = 0; i < customList.length; i++){
		response[customList[i][0]] = {}
		response[customList[i][0]].title = customList[i][1]
		response[customList[i][0]].data = new Array()
		response[customList[i][0]].labels = new Array()
		for(let j = 0; j < longest.lengthD; j++){
			response[customList[i][0]].data[j] = NaN
		}
	}

	for(let key of Object.keys(response)){
		let difference = longest.lengthD - response[key].lengthD
		let NaNArray = new Array()
		for(let i = 0; i < difference; i++){
			NaNArray[i] = NaN
		}
		response[key].data = NaNArray.concat(response[key].data)
		response[key].newLabels = longest.labels
	}

	for(let i = 0; i < longest.data.length; i++){
		response.APS.data[i] *= .01
		response.APC.data[i] = parseFloat(1 - response.APS.data[i])
		response.t.data[i] = parseFloat(1-(response.Yd.data[i]/response.Y.data[i]))
		response.C.data[i] = parseFloat(response.APC.data[i] * response.Yd.data[i])
		response.S.data[i] = parseFloat(response.APS.data[i] * response.Yd.data[i])
		response.m.data[i] = parseFloat(response.realImp.data[i]/response.Yd.data[i])
		if(i > 0){
			console.log((response.C.data[i]-response.C.data[i-1]) + "/" + (response.Yd.data[i]-response.Yd.data[i-1]))
			response.MPC.data[i] = parseFloat((((response.C.data[i]-response.C.data[i-1])/(response.Yd.data[i]-response.Yd.data[i-1]))/100)+0.5)
			response.MPS.data[i] = parseFloat((((response.S.data[i]-response.S.data[i-1])/(response.Yd.data[i]-response.Yd.data[i-1]))/100)+0.5)
			response.c.data[i] = parseFloat(response.C.data[i]-(response.MPC.data[i]*response.Yd.data[i]))
		}else{
			response.MPC.data[i] = NaN
			response.MPS.data[i] = NaN
			response.c.data[i] = NaN
		}
		response.autoEx.data[i] = parseFloat((response.c.data[i] + response.realInv.data[i] + response.realGov.data[i] + response.realExp.data[i]))
		response.inducer.data[i] = parseFloat((response.MPC.data[i]*(1-response.t.data[i]))-response.m.data[i])
		response.induEx.data[i] = parseFloat(response.Y.data[i]*((response.MPC.data[i]*(1-response.t.data[i]))-response.m.data[i]))
		response.AE.data[i] = parseFloat(response.autoEx.data[i] + (response.induEx.data[i]))
		response.AEper.data[i] = parseFloat(response.AE.data[i]/(response.pop.data[i]/1000000))
	}
	
	for(let key of Object.keys(response)){
		console.log(key + ": " + response[key].data[response[key].lengthD-1])
	}

	console.log(response)
	console.log(longest)

	doData(response, longest)
	
}

let frame = 250

function doData(stuff, longest){

	let equilibriumGDP = generateLine(("((" + parseFloat(stuff.inducer.data[frame]) + " * x) + " + parseFloat(stuff.autoEx.data[frame])+")").toString(), 0, 30000, 100)
	
	let graph = makeEquibGDPGraph('chartAnim', equilibriumGDP)
	let ctx = $('#chartAnim')
	ctx.data('chartAnim', graph)

	setInterval(AE, 100, stuff, longest)

	let labels = longest.labels
	
	addGraph([stuff.Yd, stuff.C, stuff.realPersCons, stuff.AE, stuff.realGDP], labels)
	addGraph([stuff.c], labels)
	addGraph([stuff.induEx, stuff.autoEx], labels)
	addGraph([stuff.APS, stuff.APC, stuff.m], labels)
	addGraph([stuff.AEper], labels)
	addGraph([stuff.MPC, stuff.MPS], labels)
}


function AE(response, longest){
	
	frame ++
	if(frame >= longest.data.length){
		frame = 250
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

function addGraph(indicators, labels){
	let sets = new Array()
	for(let indicator of indicators){
		sets.push(makeSet(indicator.data, indicator.title))
	}
	let config = makeConfig(labels)
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
		data: {
			labels: labels,
			datasets: []
		},
		options: {
			scales: {
				xAxes: [{ticks: {maxTicksLimit: 30}}],
				yAxes: [{
					ticks: {
						maxTicksLimit: 20,
						userCallback: function(item) {
							return (item).toString()// + " " + (unit!=undefined?unit:"")
						}
					}, 
					id: 'A', 
					position: 'left'
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
				}
				,{
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