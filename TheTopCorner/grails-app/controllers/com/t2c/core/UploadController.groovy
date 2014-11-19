package com.t2c.core

import grails.converters.JSON

import com.restfb.BinaryAttachment
import com.restfb.DefaultFacebookClient
import com.restfb.FacebookClient
import com.restfb.Parameter
import com.restfb.types.FacebookType
import com.restfb.types.Photo
import com.restfb.types.Video

class UploadController {

    def index() { 
		
	}
	
	
	/*
	 * needs following params:
	 * access_token
	 * source
	 * type (video/photo)
	 * title
	 * description
	 * scheduled_publish_time
	 */
	def uploadMediaToFacebook(){
		
		log.info "*************************\nGot request to upload media\n${params}"
		def responseJSON = [:]
		responseJSON.success = false
		responseJSON.message = "Video could not be uploaded"
		InputStream is;
		
		try{
			
			if (params.access_token && params.source){
				//get inputstream from the video url
				is = new URL(params.source).openStream();
				
				//create restfb client
				FacebookClient facebookClient = new DefaultFacebookClient(params.access_token);
				def classType, location, randomName = new Random().nextInt(10000) + 10000
				if (params.type == "video"){
					classType = Video.class
					location = "${params.pageId}/videos"
					randomName += ".mp4"
				}else if (params.type == "photo"){
					classType = Photo.class
					location = "${params.pageId}/photos"
					randomName += ".jpg"
				}
				
				FacebookType publishMessageResponse = facebookClient.publish(location, classType,
						BinaryAttachment.with(randomName, is),
						Parameter.with(params.type == "video" ? 'description' : 'message', params.description),
						Parameter.with('published', true)/*,
						Parameter.with('scheduled_publish_time', params.scheduled_publish_time)*/
					);
				if (publishMessageResponse.id){
					
					log.info "Post published successfully..! ${publishMessageResponse.id}"
					
					responseJSON.success = true
					responseJSON.message = publishMessageResponse.id			
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
		}catch (Exception e){
			log.info "Something went wrong.. printing stacktrace..."
			log.info e.printStackTrace()
		}finally{
			is.close()
			render responseJSON as JSON
		}
	}
	
}