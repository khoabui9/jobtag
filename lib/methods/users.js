Meteor.methods({
  editProfile: function (firstname, lastname, email) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    // Check if email is different before changing
    var currentEmail = Meteor.user().emails[0].address;
    if (email !== currentEmail) {
      if (Meteor.user().emails.length > 1)
      throw new Meteor.Error("Un mail de vérification est déjà en attente.");

      Meteor.users.update({ _id: Meteor.userId() }, {
        $set: {
          'profile.firstName': firstname,
          'profile.lastName': lastname,
        },
        $push: {
          'emails': {
            address: email,
            verified: false
          }
        }
      });

      if (Meteor.isServer)
      Accounts.sendVerificationEmail(Meteor.userId());
    } else {
      Meteor.users.update({ _id: Meteor.userId() }, { $set: {
        'profile.firstName': firstname,
        'profile.lastName': lastname,
      }});
    }
  },
  changeMail: function () {
    // Check if user is connected. Check number of mail.
    if (Meteor.userId() && Meteor.user().emails.length === 2) {
      var newEmail = Meteor.user().emails[1].address;
      Meteor.users.update({ _id: Meteor.userId() }, {
        $pop: {
          'emails': 1
        }
      });
      Meteor.users.update({ _id: Meteor.userId() }, {
        $set: {
          'emails.0.address': newEmail
        }
      });
    }
  },
  deleteNewEmail: function () {
    // Check if user is connected. Check number of mail.
    if (Meteor.userId() && Meteor.user().emails.length === 2) {
      Meteor.users.update({ _id: Meteor.userId() }, {
        $pop: {
          'emails': 1
        }
      });
    }
  }
});
