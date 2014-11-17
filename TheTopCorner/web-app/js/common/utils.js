var Utils = {};

Utils.loadScreen = function(linkToHTML, successCallback){
	$.ajax({
		type: "GET",
		url: linkToHTML,
		success: function(html){
			successCallback(html);;
		}
	});
};