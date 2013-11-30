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
		endpoint += 'api.asp?';

		function cmd(name){
			var url = endpoint + 'cmd=' + name;
			var i = 1;
			while (i + 1 < arguments.length){
				url += '&' + arguments[i++];
				url += '=' + encodeURIComponent(arguments[i++]);
			}

			log('GET ' + url);

			var response = HTTP.get(url);
			var xml = response.content || '<error>invalid response!</error>';
			log(xml);

			var error = parseElem(xml, 'error');
			if (error) throw new Meteor.Error(Accounts.LoginCancelledError.numericError, error);

			return xml;
		}

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

		function parseElem(xml, name){
			var e = '<' + name + '>(.+)<\\/' + name + '>';
			var match = (new RegExp(e, 'g')).exec(xml);
			if (match){
				return cdata(match[1]);
			}
			return null;
		}

		function parse(xml, schema){
			var result = {};
			Object.keys(schema).forEach(function(key){
				var p = schema[key];
				if (typeof p === 'string'){
					var v = parseElem(xml, p);
					if (v) result[key] = v;
				} else {
					throw new Error('not implemented!');
				}
			});
			return result;
		}

		function fail(xml){
			var error = parseElem(xml, 'error') || 'FogBugz Login Failed';
			throw new Meteor.Error(Accounts.LoginCancelledError.numericError, error);
		}

		var xml = cmd('logon', 'email', options.email, 'password', options.password);

		var token = parseElem(xml, 'token');
		if (!token){
			fail(xml);
		}

		log('token=' + token);

		xml = cmd('viewPerson');

		var person = parse(xml, {
			id: 'ixPerson',
			name: 'sFullName',
			email: 'sEmail',
			admin: 'fAdministrator',
			community: 'fCommunity',
			virtual: 'fVirtual',
			deleted: 'fDeleted',
			notify: 'fNotify',
			homepage: 'sHomepage',
			locale: 'sLocale',
			language: 'sLanguage'
		});

		var serviceData = {
			id: person.id,
			fogbugz: endpoint
		};

		return Accounts.updateOrCreateUserFromExternalService(serviceName, serviceData, person);
	});
})();
