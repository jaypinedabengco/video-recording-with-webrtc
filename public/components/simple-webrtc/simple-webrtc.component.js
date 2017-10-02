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
			'$scope', 'app.socket.service'		
		];

		function ComponentController(
			$scope, socketService
		) {

			var vm = this;
			
			//variables
			vm.users_list = [];

			vm.logged_in_username;	
			vm.target_username;
			vm.webrtc_connection;
			vm.webrtc_datachannel;
			vm.webrtc_local_video;
			vm.webrtc_remote_video;
			vm.webrtc_stream;

			vm.local_video; 
			vm.remote_video;

			vm.CONFIG_WEBRTC = { 
				"iceServers": [{ "url": "stun:stun.1.google.com:19302" }] 
			};

			//functions
			vm.hasUserMedia = hasUserMedia;
			vm.getUserMedia = getUserMedia;
			vm.login = login;
			vm.connectTo = connectTo;
			vm.hangup = hangup;
			vm.io_sendMessageToTarget = io_sendMessageToTarget;
			vm.handleLeave = handleLeave;

			//socket events
			vm.io_signaling_server = socketService.getSignalingServer();
			vm.io_signaling_server.on('connect', io_onConnect);			
			vm.io_signaling_server.on('disconnect', io_onDisconnect);			
			vm.io_signaling_server.on('login.success', io_onLoginSuccess);
			vm.io_signaling_server.on('login.error', io_onLoginError);
			vm.io_signaling_server.on('offer.success', io_onOfferSuccess);
			vm.io_signaling_server.on('offer.error', io_onOfferError);
			vm.io_signaling_server.on('incoming.offer', io_incomingOffer);
			vm.io_signaling_server.on('incoming.answer', io_incomingAnswer);
			vm.io_signaling_server.on('incoming.candidate', io_incomingCandidate);
			vm.io_signaling_server.on('available_users_for_call.update', io_updateUserToCallList);

			//on load
			vm.$onInit = activate;

			return ;

			////

			function activate(){			
			}
			
			/**
			 * 
			 */
			function hasUserMedia() { 
				navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia 
				   || navigator.mozGetUserMedia || navigator.msGetUserMedia; 
				return !!navigator.getUserMedia; 
			 }		
			 
			 /**
			  * 
			  */
			 function getUserMedia() {
				navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
				|| navigator.mozGetUserMedia || navigator.msGetUserMedia;

				return navigator.getUserMedia;
			 }

			 /**
			  * 
			  * @param {*} login_username 
			  */
			 function login(login_username){
				vm.io_signaling_server.emit('login', {username : login_username});
			 }

			 /**
			  * 
			  * @param {*} target_username 
			  */
			 function connectTo(target_username){
				 
				if (target_username.length > 0) { 
				   //make an offer 
				   vm.webrtc_connection.createOffer(function (offer) { 
						vm.io_sendMessageToTarget(target_username, 'offer', {
							offer : offer
						}); 
						vm.webrtc_connection.setLocalDescription(offer); 
				   }, function (error) { 
					  alert("An error has occurred."); 
				   }); 
				} 
			 }

			 /**
			  * 
			  */
			 function hangup(){
				vm.io_sendMessageToTarget(vm.target_username, 'offer', {});					
				vm.handleLeave();
			 }

			 /**
			  * 
			  */
			 function handleLeave(){
				vm.target_username = null; 
				vm.remote_video.src = null;
				 
				vm.webrtc_connection.close(); 
				vm.webrtc_connection.onicecandidate = null; 
				vm.webrtc_connection.onaddstream = null; 
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


				//********************** 
				//Starting a peer connection 
				//********************** 		
				navigator.webkitGetUserMedia({video:true, audio:true}, function(stream){

					vm.stream = stream; //set global stream

					//initialize dom elements
					vm.local_video = document.querySelector('#localVideo'); 
					vm.remote_video = document.querySelector('#remoteVideo');

					navigator.webkitGetUserMedia({video:true, audio:false}, function(for_view_stream){
						vm.local_video.src = window.URL.createObjectURL(for_view_stream);					
					}, function(){});

					vm.webrtc_connection = new webkitRTCPeerConnection(vm.CONFIG_WEBRTC); 
					
					// setup stream listening 
					vm.webrtc_connection.addStream(stream);					
				
         			//when a remote user adds stream to the peer connection, we display it 
					vm.webrtc_connection.onaddstream = function(e){
						vm.remote_video.src = window.URL.createObjectURL(e.stream);
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

				}, function(error){
					console.log('error', webkitGetUserMedia);
				});		
				
			}

			/**
			 * 
			 * @param {*} message 
			 */
			function io_onLoginError(message){
				alert("Ooops...try a different username"); 
			}

			/**
			 * 
			 * @param {*} data 
			 */
			function io_onOfferSuccess(data){
				console.log('offer success', data);
				vm.target_username = data.target_username;
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
			function io_incomingOffer(data){
				vm.target_username = data.caller_username; //set caller as target
				vm.webrtc_connection.setRemoteDescription(new RTCSessionDescription(data.offer)); 

				vm.webrtc_connection.createAnswer(function(answer){
					vm.webrtc_connection.setLocalDescription(answer);
					vm.io_sendMessageToTarget(vm.target_username, 'answer', {
						answer : answer
					});
				}, function(error){
					console.log('error on answer');
				});

			}

			/**
			 * 
			 * @param {*} answer 
			 */
			function io_incomingAnswer(answer){
				console.log('io_incomingAnswer', answer);
				vm.webrtc_connection.setRemoteDescription(new RTCSessionDescription(answer));
			}

			/**
			 * 
			 * @param {*} candidate 
			 */
			function io_incomingCandidate(candidate){
				console.log('io_incomingCandidate', candidate); 
				vm.webrtc_connection.addIceCandidate(new RTCIceCandidate(candidate));
			}	

			/**
			 * 
			 * @param {*} users_list 
			 */
			function io_updateUserToCallList(users_list){
				console.log('users to call', users_list);
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
			
		}		

})();