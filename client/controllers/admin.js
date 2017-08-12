Meteor.subscribe('news');
Meteor.subscribe('betakeys');

Template.admin.events({
  'submit #admin-news-form': function (e, t) {
    e.preventDefault();

    // Get news title and content
    var title = t.find('#admin-news-title').value;
    var content = t.find('#admin-news-content').value;

    // Edit mode
    var id = Session.get('admin.news.edited');
    if (id) {
      Meteor.call('editNews', id, title, content, function (error) {
        if (error)
        Notifications.error('Erreur', error.reason);
        else {
          Notifications.success('Terminé', 'La news a bien été modifiée.');
          t.find('#admin-news-title').value = '';
          t.find('#admin-news-content').value = '';
          t.find('#admin-news-submit').value = 'Publier';
          Session.set('admin.news.edited');
        }
      });
    } else {
      Meteor.call('addNews', title, content, function (error) {
        if (error)
        Notifications.error('Erreur', error.reason);
        else {
          Notifications.success('Terminé', 'Une nouvelle news a bien été publiée.');
          t.find('#admin-news-title').value = '';
          t.find('#admin-news-content').value = '';
        }
      });
    }
  },
  'click #admin-news-edit-cancel': function (e, t) {
    Session.set('admin.news.edited');
    t.find('#admin-news-title').value = '';
    t.find('#admin-news-content').value = '';
    t.find('#admin-news-submit').value = 'Publier';
  },
  'click #admin-beta-generate': function (e, t) {
    Meteor.call('generateKey', function (error) {
      if (error)
      Notifications.error('Erreur', error.reason);
      else
      Notifications.success('Terminé', 'Clé générée.');
    });
  },
  'click #admin-beta-delete': function (e, t) {
    var id = e.currentTarget.dataset.id;
    Meteor.call('deleteKey', id, function (error) {
      if (error)
      Notifications.error('Erreur', error.reason);
      else
      Notifications.success('Terminé', 'Clé supprimée.');
    });
  }
});

Template.admin.helpers({
  news: function () {
    return News.find({}, { sort: { createdAt: -1 }, limit: 10 });
  },
  edited: function () {
    return Session.get('admin.news.edited');
  },
  usedKeys: function () {
    return BetaKeys.find({ used: true }).count();
  },
  totalKeys: function () {
    return BetaKeys.find().count();
  },
  keys: function () {
    return BetaKeys.find({ used: false }, { sort: { createdAt: -1 }});
  }
});


Template.adminNews.events({
  'click #admin-news-edit': function (e, t) {
    // Set edit mode
    Session.set('admin.news.edited', this._id);
    // Fill fields
    $('#admin-news-submit').val('Modifier');
    $('#admin-news-title').val(this.title);
    $('#admin-news-content').val(this.content);
  },
  'click #admin-news-delete': function (e, t) {
    var self = this;
    bootbox.confirm("Êtes-vous certain de vouloir supprimer cette news ?", function(confirmed) {
      if (confirmed) {
        Meteor.call('deleteNews', self._id, function (error) {
          if (error)
          Notifications.error('Erreur', error.reason);
          else {
            Notifications.success('Terminé', 'News supprimée.');
          }
        });
      }
    });
  },
});
