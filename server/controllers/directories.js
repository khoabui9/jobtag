Meteor.publish('directories', function () {
  return Directories.find({ userId: this.userId });
});
