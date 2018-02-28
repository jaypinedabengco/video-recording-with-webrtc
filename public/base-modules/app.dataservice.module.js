(function () {
	'use strict';

	angular
		.module('app.dataservice.module', [])
		.service('app.dataservice.persistent-storage-manager', PersistentStorageManager)
		;

	/**
	 * 
	 */
	PersistentStorageManager.$inject = ['localStorageService'];
	function PersistentStorageManager(localStorageService) {

		var services = {
			set: set,
			get: get,
			remove: remove,
			setCookie: setCookie,
			getCookie: getCookie,
			removeCookie: removeCookie
		};

		return services;

		/**
		 * 
		 * @param {*} key 
		 * @param {*} value 
		 */
		function set(key, value) {
			return localStorageService.set(key, value);
		}

		/**
		 * 
		 * @param {*} key 
		 */
		function get(key) {
			return localStorageService.get(key);
		}

		/**
		 * 
		 * @param {*} key 
		 */
		function remove(key) {
			return localStorageService.remove(key);
		}

		/**
		 * 
		 * @param {*} key 
		 * @param {*} value 
		 * @param {*} expiration_in_days 
		 */
		function setCookie(key, value, expiration_in_days) {
			return localStorageService.cookie.set(key, value, expiration_in_days, true);
		}

		/**
		 * 
		 * @param {*} key 
		 */
		function getCookie(key) {
			return localStorageService.cookie.get(key);
		}

		/**
		 * 
		 * @param {*} key 
		 */
		function removeCookie(key) {
			return localStorageService.cookie.remove(key);
		}
	}
})();