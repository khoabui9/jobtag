Meteor.methods({
  registerUser: function (username, email, password, firstname, lastname) {
    if (Meteor.userId())
    throw new Meteor.Error("Vous êtes connecté.");

    var userId = Accounts.createUser({username: username, email: email, password : password, profile: {firstName: firstname, lastName: lastname}});
    Accounts.sendVerificationEmail(userId);
  },
  sendVerificationEmail: function (email) {
    var user = Meteor.users.findOne({ emails: { $elemMatch: { address: email } } });
    if (user && user._id) {
      // Send verification email
      Accounts.sendVerificationEmail(user._id);
    }
  },
  sendResetEmail: function (email) {
    var user = Meteor.users.findOne({ emails: { $elemMatch: { address: email } } });
    if (user && user._id) {
      // Send verification email
      Accounts.sendResetPasswordEmail(user._id);
    }
  },
  addBetaKey: function (token) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    if (Meteor.user() && typeof Meteor.user().betaKeyId != 'undefined')
    throw new Meteor.Error("Vous avez déjà un accès bêta.");

    if (Meteor.isServer) {
      var betakey = BetaKeys.findOne({ token: token });
      if (!betakey)
      throw new Meteor.Error("Clef bêta invalide.");
      if (betakey.used)
      throw new Meteor.Error("Clef bêta déjà utilisée.");

      Meteor.users.update({ _id: Meteor.userId() }, { $set: { betaKeyId: betakey._id } });
      BetaKeys.update({ _id: betakey._id }, { $set: { used: true, usedAt: new Date } });
    }
  }
});
