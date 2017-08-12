Meteor.methods({
  sendBugEmail: function (title, content) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    if (!title || !content || title == '' || content == '')
    throw new Meteor.Error("Un des champs est manquant.");

    // Don't block while the mail is sending
    this.unblock();

    // Send email
    if (Meteor.isServer) {
      var mailContent = 'Utilisateur : ' + Meteor.user().profile.firstName + ' ' + Meteor.user().profile.lastName + '\n';
      mailContent += 'Email : ' + Meteor.user().emails[0].address + '\n\n';
      mailContent += content;
      Email.send({
        from: "bug.reporter@jobtag.fr",
        to: "feedback@jobtag.fr",
        subject: "[BUG] " + title,
        text: mailContent
      });
    }
  }
});
