'use strict';
(function () {
	angular
		.module('app.component.module')
		.component('simpleWebrtc', {
			templateUrl: 'components/simple-webrtc/simple-webrtc.component.html',
			controller: ComponentController
		});

		/////

		ComponentController.$inject = [
			'$q', '$scope', 
			'app.socket.service', 'app.webrtc.service', 
			'app.dataservice.authentication'		
		];

		function ComponentController(
			$q, $scope, 
			socketService, webrtcService, 
			authenticationDataservice
		) {

			var vm = this;
			
			//variables
			vm.users_list = [];

			vm.logged_in_username;	
			vm.target_username;
			vm.is_caller = false;
			vm.is_recording = false;
			vm.is_call_start;
			vm.declined_call_by_user;
			vm.calling_username;
			vm.caller_username;
			
			vm.io_signaling_server;		
			vm.local_video; 
			vm.remote_video;				
			vm.webrtc_connection;
			vm.webrtc_datachannel;
			vm.webrtc_local_video;
			vm.webrtc_remote_video;

			vm.webrtc_mixed_stream;
			vm.webrtc_local_stream;
			vm.webrtc_remote_stream;
			vm.remote_audio_stream;
			vm.local_audio_stream;
			vm.for_view_stream;
			
			vm.webrtc_media_recorder;
			vm.recorded_video_chunks = [];
			vm.recorded_videos_list = [];

			vm.CONFIG_WEBRTC = { 
				"iceServers": [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]				
			};

			//functions
			vm.connectToSignalingServer = connectToSignalingServer;
			vm.login = login;
			vm.callUser = callUser;
			vm.hangup = hangup;
			vm.toggleRecording = toggleRecording;
			vm.io_sendMessageToTarget = io_sendMessageToTarget;
			vm.handleHangup = handleHangup;
			vm.startVideoInterview = startVideoInterview;
			vm.endVideoInterview = endVideoInterview;
			vm.closeStream = closeStream;
			vm.answerCall = answerCall;
			vm.declineCall = declineCall;
			vm.leaveRoom = leaveRoom;

			//socket events

			//on load
			vm.$onInit = activate;

			return ;

			////

			function activate(){			
			}

			/**
			 * 
			 * @param {*} token 
			 */
			function connectToSignalingServer(token){
				return $q(function(resolve, reject) {
					vm.io_signaling_server = socketService.getSignalingServer(token);
					vm.io_signaling_server.on('connect', io_onConnect);		
					vm.io_signaling_server.on('disconnect', io_onDisconnect);								
					vm.io_signaling_server.on('connect_failed', io_onConnectFailed);
					vm.io_signaling_server.on('login.success', io_onLoginSuccess);
					vm.io_signaling_server.on('login.error', io_onLoginError);
					vm.io_signaling_server.on('offer.success', io_onOfferSuccess);
					vm.io_signaling_server.on('offer.error', io_onOfferError);
					vm.io_signaling_server.on('incoming.call', io_incomingCall);
					vm.io_signaling_server.on('incoming.offer', io_incomingOffer);
					vm.io_signaling_server.on('incoming.answer', io_incomingAnswer);
					vm.io_signaling_server.on('incoming.candidate', io_incomingCandidate);
					vm.io_signaling_server.on('incoming.onhangup', io_incomingHangup);
					vm.io_signaling_server.on('incoming.onleave', io_incomingOnLeave);
					vm.io_signaling_server.on('available_users_for_call.update', io_updateUserToCallList);

					vm.io_signaling_server.on('call.accepted', io_callAccepted);
					vm.io_signaling_server.on('call.declined', io_callDeclined);

					vm.io_signaling_server.on('callee.readyForCall', io_calleeReadyForCall);

					resolve(vm.io_signaling_server);//end
				});					
			}

			 /**
			  * 
			  * @param {*} login_username 
			  */
			 function login(login_username, password){

				authenticationDataservice
					.login(login_username, password)
					.then(function(auth_token){
						vm.connectToSignalingServer(auth_token);
					})
					.catch(function(err){
						console.log(err);
						alert(err.message);
					});

				// vm.io_signaling_server.emit('login', {username : login_username});
			 }

			 /**
			  * 
			  */
			 function answerCall(){
				vm.declined_call_by_user = null;
				vm.startVideoInterview(function(err){
					if ( err ){
						return alert("An error has occurred."); 
					}
					vm.io_sendMessageToTarget(vm.caller_username, 'acceptCall', {});
					vm.io_sendMessageToTarget(vm.caller_username, 'calleeReadyForCall', {}); 
				});
			 }

			 /**
			  * 
			  */
			 function declineCall(){ 
				vm.io_sendMessageToTarget(vm.caller_username, 'declineCall', {});
				vm.caller_username = null;
			 }

			 /**
			  * 
			  */
			 function leaveRoom(){
				vm.io_sendMessageToTarget(null, 'leaveRoom', {});
			 }

			 /**
			  * 
			  * @param {*} target_username 
			  */
			 function callUser(target_username){
				vm.declined_call_by_user = null;				
				if (target_username.length > 0) {

					vm.calling_username = target_username;
				
					vm.startVideoInterview(function(err){
						if ( err ){
							alert(err);
						}
						vm.io_sendMessageToTarget(target_username, 'call', {});
					});

				} 
			 }

			 /**
			  * 
			  */
			 function hangup(){
				vm.io_sendMessageToTarget(vm.target_username, 'hangup', {});					
				vm.handleHangup();
				// vm.logged_in_username = null;
			 }

			 /**
			  * 
			  */
			 function handleHangup(){
				vm.endVideoInterview();
				vm.target_username = null; 
			 }	

			 /**
			  * 
			  */
			 function toggleRecording(){
				//should be the caller
				// if ( vm.is_caller ){
					//either stop or start recording...
					vm.is_recording ? stopRecording() : startRecording();
				// }
			 }

			 /**
			  * 
			  */
			 function startRecording(){
				if ( !vm.is_recording ){
					vm.is_recording = true;

					vm.io_signaling_server.emit('startRecording');

					console.log('vm.webrtc_remote_stream', vm.webrtc_mixed_stream.getTracks());
					// console.log('vm.webrtc_mixed_stream', vm.webrtc_mixed_stream);

					vm.webrtc_media_recorder = webrtcService.getMediaRecorder(vm.webrtc_mixed_stream);
					vm.webrtc_media_recorder.start(1000 * 1); //every second?

					//register chunks when available
					vm.webrtc_media_recorder.ondataavailable = function(e){
						console.log('i got the video!', e);
						vm.io_signaling_server.emit('recordVideoChunks', e.data);
						// vm.recorded_video_chunks.push(e.data);
					}

					//on error
					vm.webrtc_media_recorder.onerror = function(e){
						console.log('Error: ' + e);
						console.log('Error: ', e);
					};

					//on start
					vm.webrtc_media_recorder.onstart = function(){
						console.log('Started & state = ' + vm.webrtc_media_recorder.state);
					};

					//on stop
					vm.webrtc_media_recorder.onstop = function(){
						console.log('Stopped  & state = ' + vm.webrtc_media_recorder.state);
						vm.io_signaling_server.emit('stopRecording');
						
						// var blob = new Blob(vm.recorded_video_chunks, {type: "video/webm"});
						// vm.recorded_video_chunks = [];
						// var videoURL = window.URL.createObjectURL(blob);
						// vm.recorded_videos_list.push(videoURL);
						// $scope.$digest(); //to apply updated list

					};

				}
			 }

			 /**
			  * 
			  */
			 function stopRecording(){
				if ( vm.is_recording ){
					vm.is_recording = false;
					vm.webrtc_media_recorder.stop(); //trigger stop
				}
			 }

			 
			 /**
			  * 
			  * @param {*} logged_username 
			  */
			 function startVideoInterview(callback){				
				
				console.log('starting', 'startVideoInterview');
				//********************** 
				//Starting a peer connection 
				//********************** 	
				vm.webrtc_connection = new webkitRTCPeerConnection(vm.CONFIG_WEBRTC); 
				
				webrtcService.getUserMedia({video:true, audio:true}, function(stream){

					console.log('Im READY!');


					vm.webrtc_local_stream = stream; //set global stream

					//initialize dom elements
					vm.local_video = document.querySelector('#localVideo'); 
					vm.remote_video = document.querySelector('#remoteVideo');

					//VIDEO ONLY
					webrtcService.getUserMedia({video:true, audio:false}, function(for_view_stream){
						vm.for_view_stream = for_view_stream;
						vm.local_video.src = window.URL.createObjectURL(for_view_stream);					
					}, function(){});
					
					// setup stream listening 
					vm.webrtc_connection.addStream(stream);					
				
						//when a remote user adds stream to the peer connection, we display it 
					vm.webrtc_connection.onaddstream = function(e){

						vm.webrtc_remote_stream = e.stream;
						vm.remote_video.src = window.URL.createObjectURL(vm.webrtc_remote_stream); //add video on remote						

						//Do audio merging here..

						//mix 
						vm.remote_audio_stream = new MediaStream([vm.webrtc_remote_stream.getTracks()[0]]); //get remote audio tracks	
						vm.local_audio_stream = new MediaStream([vm.webrtc_local_stream.getTracks()[0]]); //get local audio tracks						

						window.AudioContext = window.AudioContext || window.webkitAudioContext;
						var audioContext = new AudioContext();
						var local_media_stream_source = audioContext.createMediaStreamSource( vm.local_audio_stream ),
							remote_media_stream_source =  audioContext.createMediaStreamSource( vm.remote_audio_stream );
						
						// Send the stream to MediaStream, which needs to be connected to PC
						var media_stream_destination = audioContext.createMediaStreamDestination();
							local_media_stream_source.connect(media_stream_destination);
							remote_media_stream_source.connect(media_stream_destination);

						//create mixed stream
						vm.webrtc_mixed_stream = new MediaStream();
						vm.webrtc_mixed_stream.addTrack(media_stream_destination.stream.getTracks()[0]); //mixed audio	
						vm.webrtc_mixed_stream.addTrack(vm.webrtc_remote_stream.getTracks()[1]); //remote video

					}

					//setup ice handling
					//when the browser finds an ice candidate we send it to another peer 
					vm.webrtc_connection.onicecandidate = function (event) { 
						if (event.candidate) { 
							vm.io_sendMessageToTarget(vm.target_username, 'candidate', {
								candidate : event.candidate
							});
						} 
					}; 

					return callback(null, vm.webrtc_connection);

				}, function(error){
					console.log('error', error);
					alert('Unable to access media devices, (Video & Audio), please check if you devices if working');
					return callback(err);
				});	

			 }

			 /**
			  * 
			  */
			 function endVideoInterview(){
				vm.remote_video.src = null;
				vm.local_video.src = null;

				//remove calling indicators				
				vm.caller_username = null;
				vm.calling_username = null;
				vm.target_username = null;				
				vm.is_call_start = false;
				vm.is_caller = false;

				//close streams
				vm.closeStream(vm.local_audio_stream);
				vm.closeStream(vm.remote_audio_stream);
				vm.closeStream(vm.webrtc_mixed_stream);
				vm.closeStream(vm.webrtc_local_stream);
				vm.closeStream(vm.webrtc_remote_stream);
				vm.closeStream(vm.for_view_stream);

				if ( vm.webrtc_connection ){
					vm.webrtc_connection.close(); 
					vm.webrtc_connection.onicecandidate = null; 
					vm.webrtc_connection.onaddstream = null; 						
				}
			 }

			 /**
			  * 
			  * @param {*} stream 
			  */
			 function closeStream(stream){
				if ( stream ){
					(stream.stop) ? stream.stop() : '';

					//stop audio tracks
					if ( stream.getAudioTracks() ){
						stream.getAudioTracks().forEach(function(track){
							console.log('closing audio tracks', track);
							track.stop();
						});
					}

					//stop video tracks
					if ( stream.getVideoTracks() ){
						stream.getVideoTracks().forEach(function(track){
							console.log('closing video tracks', track);
							track.stop();
						});						
					}
				}
			 }

			/**
			 * 
			 * @param {*} message 
			 */
			function io_onConnect(message){
				console.log('connected', message);
			}

			/**
			 * 
			 * @param {*} message 
			 */
			function io_onConnectFailed(message){
				alert(message);
			}

			/**
			 * 
			 * @param {*} message 
			 */
			function io_onDisconnect(message){
				console.log('disconnected', message);
			}

			/**
			 * 
			 * @param {*} message 
			 */
			function io_onLoginSuccess(data){
				//creating our RTCPeerConnection object 
				vm.logged_in_username = data.username;
			}

			/**
			 * 
			 * @param {*} message 
			 */
			function io_onLoginError(error){
				console.log('error', error);
				alert("Ooops...try a different username"); 
			}

			/**
			 * 
			 * @param {*} data 
			 */
			function io_onOfferSuccess(data){
				console.log('offer success', data);
				vm.is_caller = true;
			}

			/**
			 * 
			 * @param {*} error 
			 */
			function io_onOfferError(error){
				console.log('offer error', error);				
			}

			/**
			 * 
			 * @param {*} data 
			 */
			function io_incomingCall(data){
				vm.caller_username = data.caller_username;
			}

			/**
			 * 
			 * @param {*} data 
			 */
			function io_incomingOffer(data){
				vm.target_username = data.caller_username; //set caller as target
				vm.webrtc_connection.setRemoteDescription(new RTCSessionDescription(data.offer)); 
				vm.webrtc_connection.createAnswer(function(answer){
					vm.webrtc_connection.setLocalDescription(answer);
					vm.io_sendMessageToTarget(vm.target_username, 'answer', {
						answer : answer
					});
				}, function(error){
					return alert(err);
				});					
			}

			/**
			 * 
			 * @param {*} answer 
			 */
			function io_incomingAnswer(answer){
				console.log('io_incomingAnswer', answer);
				vm.webrtc_connection
					.setRemoteDescription(new RTCSessionDescription(answer))
					.then(() => {
						//CONNECTED
						vm.target_username = vm.calling_username;
					})
					.catch(err=>console.log('answer exception', err));
			}

			/**
			 * 
			 * @param {*} candidate 
			 */
			function io_incomingCandidate(candidate){
				console.log('io_incomingCandidate', candidate); 
				vm.webrtc_connection
					.addIceCandidate(new RTCIceCandidate(candidate))
					.then()
					.catch(err=>console.log('candidate exception', err));
			}	

			/**
			 * 
			 */
			function io_incomingHangup(){	
				handleHangup();
			}

			/**
			 * 
			 * @param {*} left 
			 */
			function io_incomingOnLeave(left){
				console.log('io_incomingOnLeave', left);
				vm.handleHangup();
			}

			/**
			 * 
			 * @param {*} users_list 
			 */
			function io_updateUserToCallList(users_list){
				vm.users_list = users_list;
			}
			
			 /**
			  * 
			  * @param {*} target_username 
			  * @param {*} type 
			  * @param {*} message 
			  */
			function io_sendMessageToTarget(target_username, type, message){
				if ( target_username ) {
					message.target_username = target_username;
				}
				vm.io_signaling_server.emit(type, message);
			}						

			/**
			 * 
			 */
			function io_callAccepted(data){

			}

			/**
			 * 
			 */
			function io_callDeclined(data){
				vm.declined_call_by_user = data.target_username;
				endVideoInterview();
			}

			/**
			 * 
			 */
			function io_calleeReadyForCall(data){
				//make an offer 
				vm.webrtc_connection.createOffer(function (offer) { 
					vm.io_sendMessageToTarget(vm.calling_username, 'offer', {
						offer : offer
					}); 
					vm.webrtc_connection.setLocalDescription(offer); 
				}, function (error) { 
					return alert("An error has occurred."); 
				}); 
			}
			
		}		

})();