requestResponse('/getTopCategories', 'data', 'parseTopCategories')

$("#removeButton").click(function(){
    $('button').remove('.subButton')
})

function parseTopCategories(response, data){
    let topCats = JSON.parse(response)
    for(let i = 0; i < topCats.length; i++){
        $( "#nav" ).append( "<button class = 'topButton' id = "+topCats[i].id+">"+topCats[i].name+"</button>" )
        jQuery("#"+eval(topCats[i].id)).click(function(){
            $('button').remove('.subButton')
            $('br').remove()
            $('#seriessNav h2').remove()
            $('#seriessNav p').remove()
            $('#nav h3').remove()
            requestResponse('/getSubCategories', topCats[i].id, 'parseSubCategories', topCats[i].name)
        })
    }
}

function parseSubCategories(response, data, category){
    let subCats = JSON.parse(response)
    if(subCats.length > 0){
        $( "#nav" ).append( "<br><br>" )
        $( "#nav" ).append( "<h3 id = 'categoryHeader'>"+category+"<h3>" )
        for(let i = 0; i < subCats.length; i++){
            $( "#nav" ).append("<button class = 'subButton' id = "+subCats[i].id+">"+subCats[i].name+"</button>" )
            jQuery("#"+eval(subCats[i].id)).click(function(){
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
    $( "#seriessNav" ).append( $( "<h2>Series</h2>" ) )
    $( "#seriessNav" ).append( $( "<p>"+seriess.seriess.length+"</p>" ) )
    let sorted = seriess.seriess.sort((a, b) => { return b.popularity - a.popularity })
    console.log(sorted.slice(0, 10))
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