# video-recording-with-webrtc
Sample Video Recording using WebRTC
 - will also use AWS Video Transcoding for video processing

* TODO 
** [SERVER] Create Simple Authentication API (sample data)
*** will return authentication token using JWT
** [CLIENT] Add authentication page/view and integrate simple authentication
** [CLIENT] Add an authentication token upon connecting to socket
** [SERVER] Validate sent token, if valid, then allow access, if not, then throw an error or something
** [CLIENT] Create a service to trigger emit along with token
** [SERVER] Convert all daos and services to accept token or user id's rather than socket id