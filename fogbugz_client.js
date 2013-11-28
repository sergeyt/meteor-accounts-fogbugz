(function () {
  Meteor.loginWithFogBugz = function (options, callback) {
    // support both (options, callback) and (callback).
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }

    /**
     * login callback to call user callback
     * @param error
     */
    var loginCallback = function (error) {
      if (!error && callback) {
        callback();
      }
    };

		Accounts.callLoginMethod({
			methodName: 'login',
			methodArguments: [
				{
					fogbugz: options.fogbugz,
					email: options.email,
					password: options.password
				}
			],
			userCallback: loginCallback
		});
  };
})();
