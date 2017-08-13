Meteor.subscribe('userData');

Template.auth.rendered = function () {
  $('[data-toggle="popover"]').popover({trigger: 'focus'});
};

Template.auth.events({
  'submit #login-form': function (e, t) {
    e.preventDefault();

    // Field input retrieval
    var email = t.find('#login-email').value,
    password = t.find('#login-password').value;

    // Login
    Meteor.loginWithPassword(email, password, function (error) {
      if (error) {
        if (error.reason == "User not found" || error.reason == "Incorrect password")
        Notifications.error('Erreur', 'Identifiants incorrects.');
        else
        Notifications.error('Erreur', 'Veuillez d\'abord vérifier votre email.');
      } else {
        Router.go('home');
        Notifications.info('Info', 'Vous êtes maintenant connecté.');
      }
    });

    return false;
  },
  'submit #register-form': function (e, t) {
    e.preventDefault();

    // Field input retrieval
    var username = t.find('#register-username').value,
    email = t.find('#register-email').value,
    password = t.find('#register-password').value,
    firstname = t.find('#register-firstname').value,
    lastname = t.find('#register-lastname').value;

    Meteor.call('registerUser', username, email, password, firstname, lastname, function(error) {
      if (error) {
        Notifications.error('Erreur', error.message);
      } else {
        Notifications.info('Info', 'Votre inscription est presque terminée. Un mail de vérification a été envoyé.');
      }
    });
  }
});

Template.authVerify.created = function () {
  if (Router.current().params.query.token) {
    Accounts.verifyEmail(Router.current().params.query.token, function(error) {
      if (error) {
        if (error.message == 'Verify email link expired [403]') {
          Notifications.error('Erreur', 'Token de vérification expiré.');
        } else {
          Notifications.error('Erreur', 'Une erreur est survenue.');
        }
      } else {
        Meteor.call('changeMail', function(error) {
          if (error) {
            Notifications.error('Erreur', error.message);
          } else {
            Notifications.success('Merci !', 'Votre email a bien été vérifié.');
            Router.go('home');
          }
        });
      }
    });
  }
};

Template.authVerify.events({
  'submit #verify-form': function (e, t) {
    e.preventDefault();

    // Field input retrieval
    var email = t.find('#verify-email').value;

    Meteor.call('sendVerificationEmail', email, function(error) {
      Notifications.info('Info', 'Un mail de vérification a été envoyé si vous êtes inscrit.');
    });

    return false;
  }
});

Template.authReset.helpers({
  token: function () {
    if (Router.current().params.query.token)
    return Router.current().params.query.token;
  }
});

Template.authReset.events({
  'submit #reset-email-form': function (e, t) {
    e.preventDefault();

    // Field input retrieval
    var email = t.find('#reset-email').value;

    Meteor.call('sendResetEmail', email, function(error) {
      Notifications.info('Info', 'Un mail de changement de mot de passe a été envoyé si vous êtes inscrit.');
    });

    return false;
  },
  'submit #reset-password-form': function (e, t) {
    e.preventDefault();

    // Field input retrieval
    var newPassword = t.find('#reset-password-new').value;
    var repeatPassword = t.find('#reset-password-repeat').value;

    if (newPassword !== '' && newPassword === repeatPassword)
    Accounts.resetPassword(Router.current().params.query.token, newPassword, function(error) {
      if (error) {
        if (error.message === 'Incorrect password [403]')
        Notifications.error('Erreur', 'Mot de passe incorrect.');
        else if (error.message === 'Token expired [403]')
        Notifications.error('Erreur', 'Token expiré.');
        else
        Notifications.error('Erreur', error.message);
      } else {
        Notifications.success('Terminé', 'Votre mot de passe a bien été changé.');
        Router.go('auth');
      }
    });
    else if (newPassword !== repeatPassword)
    Notifications.error('Erreur', 'Les deux mots de passe sont différents.');
    else
    Notifications.error('Erreur', 'Mot de passe incorrect.');

    return false;
  }
});

Template.authBeta.events({
  'submit #beta-form': function (e, t) {
    e.preventDefault();

    // Field input retrieval
    var token = t.find('#beta-key').value;

    Meteor.call('addBetaKey', token, function(error) {
      if (error)
      Notifications.error('Erreur', error.message);
      else {
        Notifications.info('Bienvenue sur JobTag !', 'Votre accès bêta est validé.');
        Router.go('home');
      }
    });

    return false;
  },
  'click #beta-disconnect': function (e, t) {
    Meteor.logout(function (error) {
      if (error)
        Notifications.error('Erreur', error.reason);

      Router.go('auth');
    });
  },
});
