Meteor.publish('userData', function() {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId}, {fields: {emails: 1, profile: 1, username: 1, betaKeyId: 1}});
  } else {
    this.ready();
  }
});
