define(["models/theTopCorner/ExtractionModels", "facebook"], function(_extractionModels){
	
	var g_extractorModel,
		g_postDataTable;
	
	var postAsPageId = "1444169292475774";
	/*var g_defaultSources = [
	    "266828596693072", "live.football.news", "345971365443086"
	    "269501959740519", "179678092221501", "FootballHighlightsAndLiveScores"
	];*/
	
	var g_defaultSources = ["266828596693072"];
	
	function refreshGlobals(){
		g_extractorModel = null;
		FB_STATUS.connected = false;
	}
	
	var FB_STATUS = {
		connected: false
	};
	
	FB.init({
		appId: '777461405654924',
        xfbml      : true,
        version    : 'v2.1'
	});
	
	function checkFBLoginStatus(){
		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
				console.log('Connected to Facebook.');
				FB_STATUS.connected = true;
				
				getPageAccessToken(function(){
					setupExtractor();					
				});
				
			} else {
				console.log('Not connected to Facebook... Trying now.');
				FB.login(checkFBLoginStatus, {scope: 'publish_actions, manage_pages', 'publish_stream'});
			}
		});		
	}
	
	function getPageAccessToken(callback){
		FB.api( '/me/accounts', {scope:"manage_pages, publish_stream"}, function(response){
			for (var i in response.data){
				var pageAccessToken = null;
				if (response.data[i].id.toString() === postAsPageId){
					pageAccessToken = response.data[i].access_token;			
					break;
				}
			}
			_extractionModels.setPageAccessToken(pageAccessToken);
			
			if (callback){
				callback();
			}
		});
	}
	
	function init(){
		console.log("Post Extractor module is loaded...");
		refreshGlobals();
		checkFBLoginStatus();
	}
	
	function setupExtractor(){
		console.log("Setting up extractor.");
		Utils.loadScreen("/html/postExtractor/extraction.html", function(htmlData){
			$("#module-window .module-content").html(htmlData);
			setupBindings();
			setupEventHandlers();
		});
	}
	
	function setupEventHandlers(){
		$("#add-default-sources").off("click");
		$("#add-default-sources").on("click", function(){
			addDefaultSources(0, function(){
				consolidatePosts();	
			});
		});
		$("#extract-posts").off("click");
		$("#extract-posts").on("click", function(){
			consolidatePosts();
		});
	}
	
	function consolidatePosts(){
		g_extractorModel.consolidateExtractedPosts();
		g_postDataTable = $('#post-feed-table').dataTable({
	        "bProcessing": true,
	    	"bSortable" : true,
	        "bLengthChange" : true, // Disable show 10,20.. records
	        "bDestroy": true,
	        "bFilter": false,
			"sPaginationType" : "full_numbers",				
			"iDisplayLength" : 10,
			"iDisplayStart" : 0
		});
		
	}
	
	function addDefaultSources(sourceIndex, completeCallback){
		if (sourceIndex < g_defaultSources.length){
			var sourceId = g_defaultSources[sourceIndex];
			if (g_extractorModel.findSource(sourceId) === -1){
				var source = new _extractionModels.Source();
				source.onDataObjectLoad(function(){
					addDefaultSources(++sourceIndex, completeCallback)
				});
				g_extractorModel.sourceList.push(source);
				source.id(sourceId);				
			}else{
				addDefaultSources(++sourceIndex, completeCallback);
			}
		}else{
			if (completeCallback){
				completeCallback();
			}
		}
	}
	
	function setupBindings(){
		g_extractorModel = new _extractionModels.Extractor(); 
		ko.applyBindings(g_extractorModel, $("#extractor-container")[0]);
	}
	
	
	return {
		init: init
	}
	
});