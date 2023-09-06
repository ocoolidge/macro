import {grapher} from './js/grapher.js';

requestResponse('/getTopCategories', 'data', 'parseTopCategories')

$("#removeButton").click(function(){
    $('button').remove('.subButton')
})

function parseTopCategories(response, data){
    let topCats = JSON.parse(response)
    for(let i = 0; i < topCats.length; i++){
        $( "#macroNav" ).append( "<button class = 'topButton' id = "+topCats[i].id+">"+topCats[i].name+"</button>" )
        jQuery("#"+eval(topCats[i].id)).click(function(){
            $('button').remove('.subButton')
            $('br').remove()
            $('#seriessNav h2').remove()
            $('#seriessNav p').remove()
            $('#macroNav h3').remove()
            $('#categoryHeader').remove()
            $('#seriess').empty()
            requestResponse('/getSubCategories', topCats[i].id, 'parseSubCategories', topCats[i].name)
        })
    }
}

function parseSubCategories(response, data, category){
    let subCats = JSON.parse(response)
    if(subCats.length > 0){
        $( "#macroNav" ).append( "<br><br>" )
        $( "#macroNav" ).append( "<h3 id = 'categoryHeader'>"+category+"<h3>" )
        for(let i = 0; i < subCats.length; i++){
            $( "#macroNav" ).append("<button class = 'subButton' id = "+subCats[i].id+">"+subCats[i].name+"</button>" )
            jQuery("#"+eval(subCats[i].id)).click(function(){
                $('#seriessNav h2').remove()
                $('#seriessNav p').remove()
                $('#seriess').empty()
                requestResponse('/getSubCategories', subCats[i].id, 'parseSubCategories', subCats[i].name)
            })
        }
    }else{
        requestResponse('/getSeriess', data, 'parseSeriess')
    }
}

function parseSeriess(response, data, category){
    let seriess = JSON.parse(response)
    $('h2').remove()
    $('p').remove()
    $( "#seriessNav" ).append( $( "<h2>" + seriess.seriess.length + " Series</h2>" ) )
    let sorted = seriess.seriess.sort((a, b) => { return b.popularity - a.popularity })
    for(let series of sorted){
        $('#seriess').append('<h3>'+series.title+'</h3>')
        $('#seriess').append(series.notes)
        $('#seriess').append('<br>')
        $('#seriess').append(series.observation_end)
        
        console.log(series.title)
        console.log(series.notes)
        console.log(series.observation_end)
    }
}

function chartIt(data){
    console.log(sorted.slice(0, 10))
    let c = 0
    for(let dat of sorted.slice(0, 10)){
        let chartEl = document.createElement("canvas")
        chartEl.id = "chart"+c.toString()
        $('#macroWrapper').append(chartEl)

        grapher([1,2,3,4,5,2,8,5,3], ['a','b','c','g','e','i','q','h','u'], "chart0", dat.title)
        c++
    }
}

function requestResponse(url, data, doWith, category){
    console.log(data)
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
			// console.log(response)
			eval(doWith+'(response, data, category)')
		},
		error:function(e){
			console.log(e)
			console.log("error occurred")
		}
	})
}