Meteor.startup(function () {
  if (Meteor.users.find().count() === 0) {
    var id = Accounts.createUser({
      username: 'root',
      email: 'raphael@jobtag.fr',
      password: '9yw3623NXgK0lr80I54i32Hp',
      profile: {
        firstName: 'Raphaël',
        lastName: 'Root',
        company: 'JobTag',
      }
    });

    // Set email to verified
    Meteor.users.update({ _id: id }, { $set: { "emails" : [ { "address" : "raphael@jobtag.fr", "verified" : true } ] } });
    // Set as admin
    Roles.addUsersToRoles(id, ['admin']);
  }
});
