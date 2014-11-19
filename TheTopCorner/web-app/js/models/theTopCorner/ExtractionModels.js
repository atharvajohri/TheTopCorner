define(["facebook"], function(){
	
	var pageAccessToken, pageId;
	
	function Extractor(){
		
		var self = this;
		
		self.sourceList = ko.observableArray();
		self.postForPageId = ko.observable("1445630119047447"); //change to "1444169292475774" or test with "1445630119047447" 
		self.scheduledPostsLink = ko.computed(function(){
			return "https://www.facebook.com/"+self.postForPageId()+"/manager/?section=scheduled_posts";
		});
		
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
		
		this.picture = ko.observable();
		this.hdPicture = ko.observable();
		this.getHDPicture = ko.observable(true);
		
		this.source = ko.observable();
		this.hdVideoURL = ko.observable(); 
		this.getHDVideoURL = ko.observable(true);
		
		this.scheduledAt = ko.observable();
		
		this.schedule = function(){
			console.log("trying to schedule " + self.name());
			
			if (self.type() === "video" && self.getHDVideoURL() === true){
				console.log(" -- trying to get HD video url");
				getHDVideoURL(self, function(){
					console.log("successfully retrieved HD url.. proceeding with schedule");
					schedulePost(self);
				}, function(){
					this.getHDVideoURL(false);
					console.log("unable to get HD video url... click schedule again to go with sd version.");
				});
			} else {
				console.log("proceeding to upload standard quality video/photo");
				schedulePost(self);
			} 
		};
	}
	
	function getHDVideoURL(model, successCallback, errorCallback){
		$.ajax({
			type: "GET",
			url: model.link(),
			success: function(data){
				try {
					/*var foundData = data.match(/\["params".*\]/)[0].match(/.*mp4/)[0];
					foundData = foundData.substring(foundData.length - 50, foundData.length);
					foundData = foundData.substring(foundData.indexOf("F")+1, foundData.length)
					
					console.log("found hd url for " + model.name());
					console.log(foundData);*/
					
					var sdLink = model.source();
//					var hdLink = sdLink.substring(0, sdLink.lastIndexOf("/")+1) + foundData + sdLink.substring(sdLink.lastIndexOf("?"), sdLink.length);
					
					//such brilliance to get the hd src! :) ~ atharva
					var hdLink = $.parseJSON(decodeURIComponent($.parseJSON(data.match(/\["params".*?\]/)[0])[1])).video_data[0].hd_src;
					
					console.log ("SD link: \n" + sdLink );
					console.log ("HD link: \n" + hdLink );
					
					model.hdVideoURL(hdLink);
					if (successCallback)
						successCallback();	
				}catch(e){
					console.log("Error while trying to get HD source...");
					console.log(e);
					if (errorCallback)
						errorCallback();
				}
				
			},
			error: function(data){
				console.log(data);
				if (errorCallback)
					errorCallback();
			},
			async: true
		});
	}
	
	function schedulePost(post){
//		$("#global-overlay").removeClass("hide");
		$("#time-scheduler-popup").removeClass("hide");
		
		$("#datetimepicker").datetimepicker({
			format: 'unixtime',
			inline: true,
			startDate: (new Date()),
			step: 10,
			onChangeDateTime: function(dp, $input){
				post.scheduledAt($input.val());
			}
		});
		
		$("#submit-time-schedule").on("click", function(){
			fireRequestToSchedulePost(pageAccessToken, (post.type() === "video" ? (post.hdVideoURL() || post.source()) : post.picture()), post.type(), post.name(), post.message(), post.scheduledAt(), function(){
				$("#cancel-time-schedule").click();
			});
		});
		
		$("#cancel-time-schedule").on("click", function(){
			$("#submit-time-schedule").off("click");
			$("#cancel-time-schedule").off("click");
			
			$("#datetimepicker").datetimepicker("destroy");
			$("#time-scheduler-popup").addClass("hide");	
		});
	}
	
	function fireRequestToSchedulePost(access_token, source, type, title, description, scheduled_publish_time, successCallback, errorCallback){
		$.ajax({
			type: "POST",
			url: "/upload/uploadMediaToFacebook",
			data: {
				access_token: access_token,
				source: source,
				title: title,
				description: description,
				type: type,
				scheduled_publish_time: scheduled_publish_time,
				pageId: pageId 
			},
			success: function(data){
				console.log(data);
				if (successCallback){
					successCallback();
				}
			},
			error: function(data){
				console.log("Error while trying to post...");
				console.log(data);
				if (errorCallback){
					errorCallback();
				}
			}
		});
	}
	
	function Source(){
		var self = this;
		
		self.id = ko.observable();
		self.name = ko.observable();
		self.audienceSize = ko.observable();
		
		self.onDataObjectLoad= ko.observable();
		
		self.getPostsFromFB = function(callback){
			self.extractedPosts.removeAll();
			FB.api(self.id() + "/posts?limit=10&fields=likes.limit(1).summary(true),type,message,name,link,picture,source,description", function(data){
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
						post.popularity( ((Number (post.likeCount()) / Number (self.audienceSize())) * 1000).toFixed(2) );
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
	
	function setPageData(accessToken, id){
		pageAccessToken = accessToken;
		pageId = id;
	}
	
	return {
		Source: Source,
		Extractor: Extractor,
		setPageData: setPageData,
		schedulePost: schedulePost
	}
	
});