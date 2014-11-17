package com.t2c.core

class UploadController {

    def index() { 
		
	}
	
	def uploadToFacebook(){
		/*log.info "*************************\nGot request to upload media\n${params}"
		def responseJSON = [:]
		
		if (params.access_token && params.source){
			//get inputstream from the video url
			InputStream is = new URL(params.source).openStream();
			
			//create restfb client
			FacebookClient facebookClient = new DefaultFacebookClient(params.access_token);
			def classType, location
			if (params.type == "video"){
				classType = Video.class
				location = "${params.pageId}/videos"
			}else if (params.type == "photo"){
				classType = Photo.class
				location = "${params.pageId}/photos"
			}
			
			FacebookType publishMessageResponse = facebookClient.publish(location, classType,
					BinaryAttachment.with(params.type == "video" ? 'test.mp4' : 'test.jpg', is),
					Parameter.with(params.type == "video" ? 'description' : 'message', params.title),
					Parameter.with('published', false),
					Parameter.with('scheduled_publish_time', params.scheduled_publish_time)
				);
			if (publishMessageResponse.id){
				responseJSON.success = true
				responseJSON.message = publishMessageResponse.id
			}else{
				responseJSON.success = false
				responseJSON.message = "Video could not be uploaded"
			}
		}else{
			def errmsg
			if (!params.access_token)
				errmsg = "No access token."
			else if (!params.source)
				errmsg = "No source."
			log.info errmsg
			responseJSON.success = false
			responseJSON.message = errmsg
		}
		
		render responseJSON as JSON*/
	}
}
