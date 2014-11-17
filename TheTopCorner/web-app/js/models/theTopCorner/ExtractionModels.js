define(["facebook"], function(){
	
	var pageAccessToken;
	
	function Extractor(){
		
		var self = this;
		
		self.sourceList = ko.observableArray();
		
		self.addSource = function(){
			self.sourceList.push(new Source());
		};
		
		self.removeSource = function(sourceToRemove){
			self.sourceList.remove(sourceToRemove);
		};
		
		self.findSource = function(sourceId){
			for (var i=0;i<self.sourceList().length;i++){
				if (self.sourceList()[i].id() === sourceId){
					return i;
				}
			}
			return -1;
		};
		
		self.consolidateExtractedPosts = function(){
			self.postList.removeAll();
			for (var i=0;i<self.sourceList().length;i++){
				var source = self.sourceList()[i];
				for (var j=0;j<source.extractedPosts().length;j++){
//					if (source.extractedPosts()[j] && source.extractedPosts()[j].likeCount() && source.extractedPosts()[j].link()){
						self.postList.push(source.extractedPosts()[j]);						
//					}
				}		
			}
		};
		
		self.postList = ko.observableArray();
	}
	
	function Post(){
		var self = this;
		
		this.id = ko.observable();
		this.name = ko.observable();
		this.link = ko.observable();
		this.message = ko.observable();
		this.type = ko.observable();
		this.likeCount = ko.observable();
		this.popularity = ko.observable();
		this.source = ko.observable();
		this.picture = ko.observable();
		
		this.schedule = function(){
			console.log("Trying to schedule " + self.name());
			
		};
	}
	
	function Source(){
		var self = this;
		
		self.id = ko.observable();
		self.name = ko.observable();
		self.audienceSize = ko.observable();
		
		self.onDataObjectLoad= ko.observable();
		
		self.getPostsFromFB = function(callback){
			self.extractedPosts.removeAll();
			FB.api(self.id() + "/posts?limit=50&fields=likes.limit(1).summary(true),type,message,name,link,picture,source", function(data){
				data = data.data;
				//populate extracted posts
				for (var i=0;i<data.length;i++){
					if (data[i].likes && data[i].link){
						var post = new Post();
						post.id(data[i].id);
						post.link(data[i].link);
						post.message(data[i].message);
						post.name(data[i].name);
						post.type(data[i].type);
						post.likeCount(data[i].likes.summary.total_count);
						post.popularity( ((Number (post.likeCount()) / Number (self.audienceSize())) * 100).toFixed(2) );
						post.picture(data[i].picture);
						post.source(data[i].source);
						
						self.extractedPosts.push(post);						
					}
				}
				
				if(callback){
					callback();
				}
			});
		};
		
		self.dataObject = ko.computed(function(){
			if (self.id()){
				FB.api("/"+self.id(), function(data){
					data.name && self.name(data.name);
					data.likes && self.audienceSize(data.likes);
					
					if (self.onDataObjectLoad){
						self.getPostsFromFB(function(){
							self.onDataObjectLoad()();
						});
					}
					
					return data;
				});	
			}
		});
		
		self.extractedPosts = ko.observableArray();
		
	}
	
	function setPageAccessToken(accessToken){
		pageAccessToken = accessToken;
	}
	
	return {
		Source: Source,
		Extractor: Extractor,
		setPageAccessToken: setPageAccessToken
	}
	
});