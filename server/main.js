Meteor.startup(function () {
  // - Mail
  if (Meteor.isServer) {
  process.env.MAIL_URL="smtp://postmaster%40mailgun.jobtag.fr:a20ed2a128e7346f74b7b4671da47df3@smtp.mailgun.org:587/";

  Accounts.config({
        sendVerificationEmail: true
  });

  // - Accounts url
  Accounts.urls.verifyEmail = function (token) {
    return Meteor.absoluteUrl('auth/verify?token=' + token);
  };
  Accounts.urls.resetPassword = function (token) {
    return Meteor.absoluteUrl('auth/reset?token=' + token);
  };
  // - Accounts mail
  Accounts.emailTemplates.from = 'JobTag <no-reply@jobtag.fr>';
  Accounts.emailTemplates.siteName = 'JobTag';
  Accounts.emailTemplates.verifyEmail.subject = function (user) {
    return 'Veuillez confirmer votre adresse email';
  };
  Accounts.emailTemplates.verifyEmail.html = function (user, url) {
    var content = '<p>Bonjour ' + user.profile.firstName + ',</p>';
    var begin;
    if (user.emails.length == 1)
    begin = 'Avant de pouvoir découvrir notre service, veuillez confirmer votre adresse email en cliquant sur ';
    else
    begin = 'Afin de pouvoir utiliser cette nouvelle adresse email, veuillez la confirmer en cliquant sur ';
    content += '<p>' + begin + '<a href="' + url + '">ce lien</a>.<br />';
    content += 'Si vous rencontrez un problème avec le lien généré dans cet email, vous pouvez nous contacter à : <a href="mailto:contact@jobtag.fr">contact@jobtag.fr</a></p>'
    content += '<p>Merci d\'utiliser JobTag.<br />Cordialement,</p>';
    content += '<p>L\'équipe JobTag</p>';
    content += '<p>Pour nous soutenir, suivez nous sur les réseaux sociaux :<br />';
    content += 'Facebook : <a href="https://www.facebook.com/JobTagapp">https://www.facebook.com/JobTagapp</a><br />';
    content += 'Twitter : <a href="https://twitter.com/jobtagapp">https://twitter.com/jobtagapp</a></p>';

    return content;
  };
}
});
