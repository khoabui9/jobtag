Meteor.methods({
  addDirectory: function (name) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    // Insert new directory
    Directories.insert({ name: name, createdAt: new Date(), userId: Meteor.userId() });
  },

  renameDirectory: function (id, name) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    var directory = Directories.findOne({ _id: id });
    if (directory.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");

    // Rename directory
    Directories.update({ _id: id }, { $set: { name: name } });
  },

  deleteDirectory: function (id) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    var directory = Directories.findOne({ _id: id });
    if (directory.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");

    // Delete directory
    Directories.remove({ _id: id });

    // Unset directory id from every linked offers
    Offers.update({ directoryId: id }, { $unset: { directoryId: '' } });
  }
});
