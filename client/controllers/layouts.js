Template.appLayout.helpers({
  directorySelected: function () {
    return typeof Session.get('directory.selected') != 'undefined' || typeof Session.get('search') != 'undefined' || Session.get('archives');
  },
});
