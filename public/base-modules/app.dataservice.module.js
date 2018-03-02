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

		var cache = {};

		var services = {
			setStorage: setStorage,
			getStorage: getStorage,
			removeStorage: removeStorage,
			setCookie: setCookie,
			getCookie: getCookie,
			removeCookie: removeCookie,
			setVariableCache: setVariableCache,
			getVariableCache: getVariableCache,
			removeVariableCache: removeVariableCache
		};

		return services;

		/**
		 * 
		 * @param {*} key 
		 * @param {*} value 
		 */
		function setStorage(key, value) {
			return localStorageService.set(key, value);
		}

		/**
		 * 
		 * @param {*} key 
		 */
		function getStorage(key) {
			return localStorageService.get(key);
		}

		/**
		 * 
		 * @param {*} key 
		 */
		function removeStorage(key) {
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


		/**
		 * 
		 * @param {*} key 
		 * @param {*} value 
		 */
		function setVariableCache(key, value) { 
			cache[key] = value;
			return cache[key];
		}

		/**
		 * 
		 * @param {*} key 
		 */
		function getVariableCache(key) { 
			return cache[key];
		}

		/**
		 * 
		 * @param {*} key 
		 */
		function removeVariableCache(key) { 
			delete cache[key];
		}

	}
})();