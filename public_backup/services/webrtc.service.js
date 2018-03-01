'use strict';
(function () {

    angular
        .module('app.service.module')
        .factory('app.webrtc.service', Service);

    Service.$inject = [];
    function Service() {

        //onload, set usermedia    
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;        

        var services = {
            getBrowser: getBrowser, 
            getUserMedia : getUserMedia, //set navigator default usermedia
            getMediaRecorder : getMediaRecorder, 
            isBrowserAllowedForWebRTC : isBrowserAllowedForWebRTC
        }

        return services;

        //////////

        /**
         * 
         * @param {*} constraints 
         * @param {*} callback 
         * @param {*} error_callback 
         */
        function getUserMedia(constraints, callback, error_callback){
            navigator.getUserMedia(constraints, callback, error_callback);
        }

        /**
         * 
         */
        function isBrowserAllowedForWebRTC(){
            return (typeof MediaRecorder === 'undefined' || !navigator.getUserMedia);
        }

        /**
         * MediaRecorder.isTypeSupported is a function announced in https://developers.google.com/web/updates/2016/01/mediarecorder and later introduced in the MediaRecorder API spec http://www.w3.org/TR/mediastream-recording/
         */
        function getMediaRecorder(stream){
            var mediaRecorder;
            if (typeof MediaRecorder.isTypeSupported == 'function'){
                if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                  var options = {mimeType: 'video/webm;codecs=vp9'};
                } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
                  var options = {mimeType: 'video/webm;codecs=h264'};
                } else  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                  var options = {mimeType: 'video/webm;codecs=vp8'};
                }
                console.log('Using '+options.mimeType);
                mediaRecorder = new MediaRecorder(stream, options);
            } else {
                console.log('isTypeSupported is not supported, using default codecs for browser');
                mediaRecorder = new MediaRecorder(stream);
            }      
            return mediaRecorder;      
        }

        /**
         * Will return one of the following : 
         * 
         * * Microsoft Internet Explorer
         * * Opera
         * * Firefox
         * * Chrome
         * * Safari
         */
        function getBrowser() {
            var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;
            var browserName = navigator.appName;
            var fullVersion = '' + parseFloat(navigator.appVersion);
            var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset, ix;

            // In Opera, the true version is after "Opera" or after "Version"
            if ((verOffset = nAgt.indexOf("Opera")) != -1) {
                browserName = "Opera";
                fullVersion = nAgt.substring(verOffset + 6);
                if ((verOffset = nAgt.indexOf("Version")) != -1)
                    fullVersion = nAgt.substring(verOffset + 8);
            }
            // In MSIE, the true version is after "MSIE" in userAgent
            else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
                browserName = "Microsoft Internet Explorer";
                fullVersion = nAgt.substring(verOffset + 5);
            }
            // In Chrome, the true version is after "Chrome"
            else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
                browserName = "Chrome";
                fullVersion = nAgt.substring(verOffset + 7);
            }
            // In Safari, the true version is after "Safari" or after "Version"
            else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
                browserName = "Safari";
                fullVersion = nAgt.substring(verOffset + 7);
                if ((verOffset = nAgt.indexOf("Version")) != -1)
                    fullVersion = nAgt.substring(verOffset + 8);
            }
            // In Firefox, the true version is after "Firefox"
            else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
                browserName = "Firefox";
                fullVersion = nAgt.substring(verOffset + 8);
            }
            // In most other browsers, "name/version" is at the end of userAgent
            else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
                (verOffset = nAgt.lastIndexOf('/'))) {
                browserName = nAgt.substring(nameOffset, verOffset);
                fullVersion = nAgt.substring(verOffset + 1);
                if (browserName.toLowerCase() == browserName.toUpperCase()) {
                    browserName = navigator.appName;
                }
            }
            // trim the fullVersion string at semicolon/space if present
            if ((ix = fullVersion.indexOf(";")) != -1)
                fullVersion = fullVersion.substring(0, ix);
            if ((ix = fullVersion.indexOf(" ")) != -1)
                fullVersion = fullVersion.substring(0, ix);

            majorVersion = parseInt('' + fullVersion, 10);
            if (isNaN(majorVersion)) {
                fullVersion = '' + parseFloat(navigator.appVersion);
                majorVersion = parseInt(navigator.appVersion, 10);
            }
            return browserName;
        }

    }

})();