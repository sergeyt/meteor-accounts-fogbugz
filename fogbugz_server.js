(function() {

	var serviceName = 'fogbugz';

	Meteor.startup(function() {
		var config = Accounts.loginServiceConfiguration.findOne({service: serviceName});
		if (!config) {
			Accounts.loginServiceConfiguration.insert({ service: serviceName });
		}
	});

	Accounts.registerLoginHandler(function(options) {
		if (!options.fogbugz && !options.email && !options.password)
			return undefined; // don't handle

		var verbose = options.verbose;
		function log(msg){
			if (verbose) {
				console.log('fogbugz: ' + msg);
			}
		}

		var endpoint = options.fogbugz;
		if (endpoint.charAt(endpoint.length - 1) != '/'){
			endpoint += '/';
		}

		var url = endpoint + 'api.asp?cmd=logon' +
				'&email=' + encodeURIComponent(options.email) +
				'&password=' + encodeURIComponent(options.password);

		var xml = Meteor.http.get(url);
		log(xml);

		var match = (/<token>(.*)<\/token>/g).exec(xml);
		if (match){
			var token = match[1];
			return Accounts.updateOrCreateUserFromExternalService(serviceName, {
				fogbugz: options.fogbugz,
				email: options.email,
				token: token
			});
		}

		throw new Meteor.Error(Accounts.LoginCancelledError.numericError, 'FogBugz Login Failed');
	});
})();
