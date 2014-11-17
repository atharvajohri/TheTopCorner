requirejs.config({
	baseUrl : "js",
	shim: {
		'facebook' : {
			exports: 'FB'
		}
	},
	paths: {
		'facebook': '//connect.facebook.net/en_US/all'
	},
	waitSeconds: "20"
});

//start here
$(window).load(function(){
	$("#goto_t2c_postextractor").on("click", function(){
		initiateExtraction();
	});
	
	if (window.location.hash === "#extract"){
		initiateExtraction();
	}
});

function initiateExtraction(){
	require(["controllers/postExtractor"], function(_postExtractor){
		_postExtractor.init();
	});
}



