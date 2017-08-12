Meteor.startup(function () {
  process.env.BIND_IP="127.0.0.1";

  // Settings
  Settings = {};
  // - Debug & pre-production
  Settings.DEBUG = false;
  Settings.PREPROD = false;

  // Configuration
  // - Filesystem
  if (Settings.DEBUG)
  FS.debug = true;

  // - Basic authentication
  if (Settings.PREPROD) {
    var basicAuth = new HttpBasicAuth("jobtag", "jobtagrules");
    basicAuth.protect();
  }
});
