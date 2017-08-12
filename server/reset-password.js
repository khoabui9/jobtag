Meteor.startup(function () {
  Accounts.emailTemplates.resetPassword.subject = function (user) {
    return 'Réinitialisation du mot de passe';
  };
  Accounts.emailTemplates.resetPassword.html = function (user, url) {
    var content = '<p>Bonjour ' + user.profile.firstName + ',</p>';
    content += '<p>Pour procéder à la réinitialisation de votre mot de passe, veuillez cliquer sur <a href="' + url + '">ce lien</a>.<br />';
    content += 'Si vous rencontrez un problème avec le lien généré dans cet email, vous pouvez nous contacter à : <a href="mailto:contact@jobtag.fr">contact@jobtag.fr</a></p>'
    content += '<p>Merci d\'utiliser JobTag.<br />Cordialement,</p>';
    content += '<p>L\'équipe JobTag</p>';
    content += '<p>Pour nous soutenir, suivez nous sur les réseaux sociaux :<br />';
    content += 'Facebook : <a href="https://www.facebook.com/JobTagapp">https://www.facebook.com/JobTagapp</a><br />';
    content += 'Twitter : <a href="https://twitter.com/jobtagapp">https://twitter.com/jobtagapp</a></p>';

    return content;
  };
  // - Accounts abort login if user is not verified
  Accounts.validateLoginAttempt(function (attempt) {
    if (attempt.user && attempt.user.emails && !attempt.user.emails[0].verified) {
      // Abort login
      return false;
    }
    return true;
  });
});
