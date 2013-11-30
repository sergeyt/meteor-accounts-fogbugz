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

		function cdata(s){
			var prefix = '<![CDATA[';
			var suffix = ']]>';
			var i = s.indexOf(prefix) >= 0;
			if (i >= 0){
				var j = s.lastIndexOf(suffix);
				return s.substring(i + prefix.length, j);
			}
			return s;
		}

		var match = (/<token>(.+)<\/token>/g).exec(xml);
		if (match){
			// TODO get user info
			var token = cdata(match[1]);
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
