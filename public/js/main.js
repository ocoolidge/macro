$(document).ready(go)

function go(){
	getGDPData()
	function getGDPData(){
		console.log("in getGraphData()")
		let mData = {clientPhrase:"stocks"}
		$.ajax({
			type: "POST",
			data: JSON.stringify(mData),
			url:'/getGDPData',
			processData: false,
			contentType: "application/json",
			cache: false,
			timeout: 600000,
			success: function (response) {
				console.log("we had success!")
				//parseData(response)
				parseRawData(response)},
			error:function(e){
				console.log(e)
				console.log("error occurred")
			}
		}
	)}
}

function parseRawData(response){
	
	let keys = Object.keys(response)
	for(let key of keys){
		response[key].data = response[key].data.reverse()
		response[key].labels = response[key].labels.reverse()
	}
	//AE = autonomous expenditure + induced expenditure = [c + I + G + X] + [MPC(1 - t) - m]Y
	let newSeriess = ['APS', 'APC', 'MPC', 'MPS', 'm', 'c', 'Yd', 'autoEX', 'induEX', 'AE', 'logGDP', 'logInduEX', 'logAutoEX', 'logAE',
					'AEper', 'C']
	for(let name of newSeriess){
		response[name] = {}
		response[name].data = new Array()
		response[name].labels = new Array()
	}
	keys = Object.keys(response)

	let labels = new Array()
	let length = Math.min(response.persSave.data.length, response.dispPersInc.data.length, response.impGDP.data.length)
	let GDP = new Array()

	for(let i = 0; i < length; i++){
		labels[i] = response.persSave.labels[i]
		GDP[i] = response.GDP.data[i]
		response.Yd.data[i] = response.dispPersInc.data[i]
		response.APS.data[i] = response.persSave.data[i]/response.Yd.data[i]
		response.APC.data[i] = 1 - (response.persSave.data[i]/response.Yd.data[i])
		response.C.data[i] = (1 - (response.persSave.data[i]/response.Yd.data[i]))*response.Yd.data[i]
		response.m.data[i] = response.impGDP.data[i]/response.Yd.data[i]
	}for(let i = 0; i < length; i++){
		if(i < length-1){
			response.MPC.data[i] = (response.C.data[i]-response.C.data[i+1])/(response.Yd.data[i]-response.Yd.data[i+1])
			response.MPS.data[i] = (response.persSave.data[i]-response.persSave.data[i+1])/(response.Yd.data[i]-response.Yd.data[i+1])
		}else{
			response.MPC.data[i] = null
			response.MPS.data[i] = null
		}
		response.c.data[i] = response.C.data[i]-(response.MPC.data[i]*response.Yd.data[i])
		response.autoEX.data[i] = (response.c.data[i] + response.invGDP.data[i] + response.govGDP.data[i] + response.expGDP.data[i])
		response.induEX.data[i] = (response.MPC.data[i] - response.m.data[i])*response.Yd.data[i]
		response.AE.data[i] = response.autoEX.data[i] + response.induEX.data[i]
		response.AEper.data[i] = response.AE.data[i] / response.pop.data[i]
		response.logAutoEX.data[i] = Math.log(response.autoEX.data[i])
		response.logInduEX.data[i] = Math.log(response.induEX.data[i])
		response.logAE.data[i] = Math.log(response.AE.data[i])
		response.logGDP.data[i] = Math.log(response.GDP.data[i])
	}

	//console.log('AE = c: ' + c + ' + I: ' + I + ' + G: '+ G + ' + X: '+ X + ' + m * MPC: ' + m*MPC + ' * Yd')
	let date = 0
	console.log('AE = c: ' + parseFloat(response.c.data[date] + response.invGDP.data[date] + response.govGDP.data[date] + response.expGDP.data[date]) + ' + MPC-m ' + parseFloat(response.MPC.data[date] - response.m.data[date]) +  ' * Yd: ' + response.Yd.data[date])
	console.log('AE = ' + parseFloat(response.c.data[date] + response.invGDP.data[date] + response.govGDP.data[date] + response.expGDP.data[date] + ((response.MPC.data[date]-response.m.data[date]) * response.Yd.data[date])))
	console.log(response.AE.data[date])
	console.log('GDP: ' + GDP[date])
	console.log(response)
	console.log(response.persSave.labels[date])

	var xValues = [];
	var yValues = [];
	generateData(("x * " + parseFloat(response.MPC.data[date]-response.m.data[date]) + " + " + parseFloat(response.c.data[date] + response.invGDP.data[date] + response.govGDP.data[date] + response.expGDP.data[date])/1000000000000).toString()
	, 0, (GDP[date]/100000000000)/2, 1);

	var yValues2 = [];
	var xValues2 = [];
	generateData2(("x").toString()
	, 0, (GDP[date]/100000000000)/2, 1)

	new Chart("myChart", {
		type: "line",
		data: {
			labels: xValues,
			datasets: [{
				label: 'AE',
				fill: false,
				pointRadius: 1,
				borderColor: "rgba(255,0,0,0.5)",
				data: yValues
				},{
				label: "45 degree",
				fill: false,
				pointRadius: 1,
				borderColor: "rgba(255,0,0,0.5)",
				data: yValues2
			}]
		},
		options: {
			scales: {
				xAxes: [{ticks: {
					maxTicksLimit: 30,
					userCallback: function(item) {
						return (item/1).toString() + " trillion"
					}
				}}],
				yAxes: [{
					ticks: {
						maxTicksLimit: 20,
						userCallback: function(item) {
							return (item/1).toString() + " trillion"
						}
					}, 
					id: 'A', 
					position: 'left'
				}]
			}
		}
	});

	function generateData(value, i1, i2, step = 1) {
		for (let x = i1; x <= i2; x += step) {
			yValues.push(eval(value));
			xValues.push(x);
		}
	}

	function generateData2(value, i1, i2, step = 1) {
		for (let x = i1; x <= i2; x += step) {
			yValues2.push(eval(value));
			xValues2.push(x);
		}
	}

	for(let key of keys){
		response[key].data = response[key].data.reverse()
		response[key].labels = response[key].labels.reverse()
	}
	labels = labels.reverse()
	GDP = GDP.reverse()

	let sets6 = new Array()
	sets6[0] = makeSet(response.AEper.data, 'Aggregate Expenditure per person')
	//sets6[1] = makeSet(response.MPC.data, 'Marginal Propensity to Consume')
	let config6 = makeConfig(labels, 1, 1)
	config6.data.datasets = sets6
	var ctx = document.getElementById("6").getContext('2d')
	var myChart = new Chart(ctx, config6)

	let sets5 = new Array()
	sets5[0] = makeSet(response.MPS.data, 'Marginal Propensity to Save')
	sets5[1] = makeSet(response.MPC.data, 'Marginal Propensity to Consume')
	let config5 = makeConfig(labels, 1, 1)
	config5.data.datasets = sets5
	var ctx = document.getElementById("5").getContext('2d')
	var myChart = new Chart(ctx, config5)

	let sets1 = new Array()
	sets1[0] = makeSet(response.APS.data, 'Average Propensity to Save')
	sets1[1] = makeSet(response.APC.data, 'Average Propensity to Consume')
	sets1[2] = makeSet(response.m.data, 'Marginal Propensity to Import')
	let config1 = makeConfig(labels, 1, 1)
	config1.data.datasets = sets1
	var ctx = document.getElementById("1").getContext('2d')
	var myChart = new Chart(ctx, config1)

	let sets2 = new Array()
	sets2[0] = makeSet(response.Yd.data, 'Desired Consumption', 'A')
	sets2[1] = makeSet(response['conGDP'].data, 'Consumption', 'A')
	sets2[2] = makeSet(response['impGDP'].data, 'Imports', 'A')
	sets2[3] = makeSet(response.c.data, 'Autonomous Consumption', 'B')
	let config2 = makeConfig(labels, 2, 1)
	config2.data.datasets = sets2
	//config2.options.scales.yAxes[0].display = false
	console.log(config2)
	var ctx = document.getElementById("2").getContext('2d')
	var myChart = new Chart(ctx, config2)

	let sets3 = new Array()
	sets3[0] = makeSet(response.logAE.data, 'log Aggregate Expenditure')
	sets3[1] = makeSet(response.logGDP.data, 'log GDP')
	sets3[2] = makeSet(response.logInduEX.data, 'log Induced Expenditure')
	sets3[3] = makeSet(response.logAutoEX.data, 'log Autonomous Expenditure')
	let config3 = makeConfig(labels, 1, 1)
	config3.data.datasets = sets3
	var ctx = document.getElementById("3").getContext('2d')
	var myChart = new Chart(ctx, config3)

	let sets4 = new Array()
	sets4[0] = makeSet(response.AE.data, 'Aggregate Expenditure')
	sets4[1] = makeSet(GDP, 'GDP')
	sets4[2] = makeSet(response.induEX.data, 'Induced Expenditure')
	sets4[3] = makeSet(response.autoEX.data, 'Autonomous Expenditure')
	let config4 = makeConfig(labels, 1, 1000000000000, 'trillion')
	config4.data.datasets = sets4
	var ctx = document.getElementById("4").getContext('2d')
	var myChart = new Chart(ctx, config4)

}

function makeConfig(labels, numGroups, scaler, unit){
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
							return (item/scaler).toString() + " " + (unit!=undefined?unit:"")
						}
					}, 
					id: 'A', 
					position: 'left'
				}]
			}
		}
	}
	let ids = ['B', 'C', 'D', 'E', 'F']
	for(let i = 0; i < numGroups-1; i++){
		config.options.scales.yAxes.push({
			ticks: {
				maxTicksLimit: 20,
				userCallback: function(item) {
					return (item/scaler).toString() + " " + (unit!=undefined?unit:"")
				}
			}, 
			id: ids[i], 
			position: 'left'
		})
	}
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