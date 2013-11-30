(function() {
	Meteor.loginWithFogBugz = function(options, callback) {
		Accounts.callLoginMethod({
			methodName: 'login',
			methodArguments: [
				{
					fogbugz: options.fogbugz,
					email: options.email,
					password: options.password,
					verbose: options.verbose
				}
			],
			userCallback: callback
		});
	};
})();
