Package.describe({
  summary: "Login service for FogBugz accounts."
});

Package.on_use(function(api, where) {
  api.use('accounts-base', ['client', 'server']);
  api.use('http', ['server']);

  api.add_files('fogbugz_server.js', 'server');
  api.add_files('fogbugz_client.js', 'client');
});
