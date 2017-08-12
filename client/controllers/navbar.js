Template.navbar.rendered = function () {
  $('#bug-report-button').popover({
    html : true,
    placement: 'bottom',
    content: function() {
      return $(".popover-content-template[data-for=bug-button]").html();
    }
  });
}

Template.navbar.helpers({
  search: function () {
    return Session.get('search');
  }
});

Template.navbar.events({
  'submit #navbar-search-form': function (e, t) {
    e.preventDefault();

    var search = t.find('#navbar-search').value;

    Session.set('directory.selected');
    Session.set('search', search);
  },
  'click #navbar-search-cancel': function (e, t) {
    Session.set('search');
    Session.set('directory.selected', 'all-offers');
  },
  'click #navbar-menu-archives': function (e, t) {
    if (Session.get('archives')) {
      Session.set('archives', false);
      Session.set('directory.selected', 'all-offers');
    } else {
      Session.set('archives', true);
      Session.set('directory.selected');
    }
  },
  'click #disconnect': function (e, t) {
    Meteor.logout(function (error) {
      if (error)
      Notifications.error('Erreur', error.reason);

      Router.go('auth');
    });
  },
  'submit #bug-report .popover form': function (e, t) {
    e.preventDefault();

    var title = t.find('#bug-report .popover form input[name=title]').value;
    var content = t.find('#bug-report .popover form textarea').value;

    Meteor.call('sendBugEmail', title, content, function (error, result) {
      if (error) {
        Notifications.error('Erreur', error.message);
      } else {
        $('#bug-report-button').popover('hide');
        Notifications.success('Merci beaucoup !', 'Notre équipe technique va tout faire pour le corriger.');
      }
    });
  }
});
