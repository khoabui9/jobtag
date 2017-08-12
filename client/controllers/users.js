Template.profile.helpers({
  profile: function () {
    return Meteor.user().profile;
  },
  email: function () {
    return Meteor.user().emails[0].address;
  },
  emailWaiting: function () {
    if (Meteor.user().emails[1])
    return Meteor.user().emails[1].address;
  },
  edited: function (edited) {
    return Session.get('profile.edited') ? 'edited' : '';
  },
  edit: function () {
    return Session.get('profile.edited') ? '' : 'hide';
  },
  hideEdit: function () {
    return Session.get('profile.edited') ? 'hide' : '';
  },
});

Template.profile.events({
  'click #profile-edit': function (e, t) {
    Session.set('profile.edited', true);
  },
  'click #profile-edit-cancel': function (e, t) {
    Session.set('profile.edited', false);
  },
  'click #profile-edit-validate': function (e, t) {
    // Data retrieval
    var firstname = t.find('#profile-edit-firstName').value;
    var lastname = t.find('#profile-edit-lastName').value;
    var email = t.find('#profile-edit-email').value;

    var oldPassword = t.find('#profile-edit-password-old').value;
    var newPassword = t.find('#profile-edit-password-new').value;
    var repeatPassword = t.find('#profile-edit-password-repeat').value;

    if (oldPassword !== '' && newPassword !== '' && newPassword === repeatPassword)
    Accounts.changePassword(oldPassword, newPassword, function (error) {
      if (error) {
        if (error.message === 'Incorrect password [403]')
        Notifications.error('Erreur', 'Mot de passe incorrect');
        else
        Notifications.error('Erreur', error.message);
      } else {
        Notifications.success('Terminé', 'Votre mot de passe a bien été changé.');
      }

      // Cleanup fields
      t.find('#profile-edit-password-old').value = '';
      t.find('#profile-edit-password-new').value = '';
      t.find('#profile-edit-password-repeat').value = '';
    });
    else if (newPassword !== repeatPassword)
    Notifications.error('Erreur', 'La confirmation du mot de passe ne correspond pas.');

    var emailCount = Meteor.user().emails.length;

    // Edit profile
    Meteor.call('editProfile', firstname, lastname, email, function (error) {
      if (error) {
        Notifications.error('Erreur', error.message);
      } else {
        Notifications.success('Terminé', 'Votre profil a bien été édité.');
        if (emailCount < Meteor.user().emails.length) {
          Notifications.info('Info', 'Pour valider votre nouvelle adresse, un email de vérification a été envoyé.');
          t.find('#profile-edit-email').value = Meteor.user().emails[0].address;
        }
        Session.set('profile.edited', false);
      }
    });
  },
  'click #profile-edit-email-resend': function (e, t) {
    // Data retrieval
    var email = Meteor.user().emails[1].address;

    // Resend verification mail
    Meteor.call('sendVerificationEmail', email, function (error) {
      if (error) {
        Notifications.error('Erreur', error.message);
      } else {
        Notifications.success('Terminé', 'Un nouvel email de vérification a été envoyé.');
        Session.set('profile.edited', false);
      }
    });
  },
  'click #profile-edit-email-delete': function (e, t) {
    // Data retrieval
    var email = Meteor.user().emails[1].address;

    // Delete pending new address
    Meteor.call('deleteNewEmail', function (error) {
      if (error) {
        Notifications.error('Erreur', error.message);
      } else {
        Notifications.success('Terminé', 'Le changement d\'email a été annulé.');
        Session.set('profile.edited', false);
      }
    });
  },
});
