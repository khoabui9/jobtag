Meteor.publish('offers', function () {
  return Offers.find({ userId: this.userId });
});
Meteor.publish('resumes', function () {
  return Resumes.find({ ownerId: this.userId });
});
Meteor.publish('coveringLetters', function () {
  return CoveringLetters.find({ ownerId: this.userId });
});
