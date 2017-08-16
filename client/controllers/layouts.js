Template.appLayout.helpers({
  directorySelected: function () {
    return typeof Session.get('directory.selected') != 'undefined' || typeof Session.get('search') != 'undefined' || Session.get('archives');
  },
  isAllOffers: function() {
    return Session.get('directory.selected') != 'all-offers';
  }
});