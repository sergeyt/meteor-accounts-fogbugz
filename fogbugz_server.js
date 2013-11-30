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
			if (!!verbose) {
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

		var response = HTTP.get(url);
		var xml = response.content;
		log(xml);

		var match = (/<token>(.*)<\/token>/g).exec(xml);
		if (match){
			// TODO get user info
			var token = match[1];
			log('token=' + token);
			return Accounts.updateOrCreateUserFromExternalService(serviceName, {
				id: token,
				fogbugz: endpoint,
				email: options.email,
				token: token
			});
		}

		throw new Meteor.Error(Accounts.LoginCancelledError.numericError, 'FogBugz Login Failed');
	});
})();
