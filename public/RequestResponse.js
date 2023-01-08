export default function requestCode(url, data) {
	$.ajax({
	type: "POST",
	data: JSON.stringify({clientPhrase:data}),
	url:url,
	processData: false,
	contentType: "application/json",
	cache: false,
	timeout: 600000,
		success: function (response) {
			console.log("we had success!")
			return response
		},
		error:function(e){
			console.log(e)
			console.log("error occurred")
		}
	})
}