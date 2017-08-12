Meteor.subscribe('directories');

Template.directories.events({
  'submit #directory-add-form, click #directory-add-submit': function (e, t) {
    e.preventDefault();

    // Get directory name
    var name = t.find('#directory-add-name').value;

    Meteor.call('addDirectory', name, function (error) {
      if (error) {
        if (error.reason === "Name failed regular expression validation")
        Notifications.error('Mauvais nom de dossier', 'Le nom de dossier ne peut contenir que des lettres (a-z ou A-Z), des chiffres (0-9), des tirets (-) ou des underscores (_). La taille doit être comprise entre 2 et 32 caractères.', { timeout: 5000 });
        else
        Notifications.error('Erreur', error.message);
      } else {
        Notifications.success('Terminé', 'Votre nouveau dossier \'' + name + '\' a bien été créé.');
        t.find('#directory-add-name').value = '';
      }
    });
  },
  'click .all-offers': function (e, t) {
    Session.set('directory.selected', 'all-offers');
    Session.set('archives');
  }
});

Template.directories.helpers({
  search: function () {
    return Session.get('search');
  },
  directories: function () {
    return Directories.find({ userId: Meteor.userId() });
  },
  allOffers: function () {
    return Session.get('directory.selected') === 'all-offers' && !Session.get('archives') && !Session.get('search');
  },
  archives: function () {
    return Session.get('archives');
  }
});

Template.directory.events({
  'submit #directory-rename-form, click #directory-rename-submit': function (e, t) {
    e.preventDefault();

    // Get directory name
    var name = t.find('#directory-rename-name').value;

    Meteor.call('renameDirectory', this._id, name, function (error) {
      if (error) {
        if (error.reason === "Name failed regular expression validation")
        Notifications.error('Mauvais nom de dossier', 'Le nom de dossier ne peut contenir que des lettres (a-z ou A-Z), des chiffres (0-9), des tirets (-) ou des underscores (_). La taille doit être comprise entre 2 et 32 caractères.', { timeout: 5000 });
        else
        Notifications.error('Erreur', error.message);
      } else {
        Notifications.success('Terminé', 'Votre dossier a bien été renommé.');
        Session.set('directory.edited', '');
      }
    });
  },
  'click .name': function (e, t) {
    var directory = e.target;

    Session.set('directory.selected', this._id);
    Session.set('search');
    Session.set('archives');

    console.log(Session.get('directory.selected'));
  },
  'click .edit': function (e, t) {
    var directory = e.target;

    Session.set('directory.edited', this._id);
  },
  'click .delete': function (e, t) {
    var directory = e.target;

    var self = this;
    bootbox.confirm("Êtes-vous certain de vouloir supprimer ce dossier ?", function(confirmed) {
      if (confirmed) {
        Meteor.call('deleteDirectory', self._id, function (error) {
          if (error) {
            Notifications.error('Erreur', error.message);
          } else {
            Notifications.success('Terminé', 'Votre dossier a bien été supprimé.');
          }
        });
      }
    });
  }
});

Template.directory.helpers({
  selected: function () {
    return Session.get('directory.selected') == this._id;
  },
  edited: function () {
    return Session.get('directory.edited') == this._id;
  }
});
