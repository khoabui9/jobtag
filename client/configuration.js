Meteor.startup(function () {
  // Notifications
  Notifications.defaultOptions.timeout = 3000;
});

// i18n
getUserLanguage = function () {
  return "fr";
};
TAPi18n.setLanguage(getUserLanguage());

// Google maps javascript API
Meteor.startup(function() {
  GoogleMaps.load({ v: '3', libraries: 'geometry,places' });
});

// Offers order
Session.set('offers.order', 'date');
Session.set('offers.order.type', 'desc');
