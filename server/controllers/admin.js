Meteor.publish('news', function () {
  return News.find();
});
Meteor.publish('betakeys', function () {
  if (Roles.userIsInRole(this.userId, ['admin']))
  return BetaKeys.find();
});
