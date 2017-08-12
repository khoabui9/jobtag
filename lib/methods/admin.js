Meteor.methods({
  addNews: function (title, content) {
    if (!Meteor.userId())
    throw new Meteor.Error("not-connected", "Vous n'êtes pas connecté.");

    if (!Roles.userIsInRole(Meteor.userId(), ['admin']))
    throw new Meteor.Error("not-allowed", "Vous ne pouvez pas faire ça.");

    if (!title || !content || title === '' || content === '')
    throw new Meteor.Error("missing-field", "Un des champs est manquant.");

    // Add news
    News.insert({
      title: title,
      content: content,
      createdAt: new Date(),
      userId: Meteor.userId()
    });
  },
  editNews: function (id, title, content) {
    if (!Meteor.userId())
    throw new Meteor.Error("not-connected", "Vous n'êtes pas connecté.");

    if (!Roles.userIsInRole(Meteor.userId(), ['admin']))
    throw new Meteor.Error("not-allowed", "Vous ne pouvez pas faire ça.");

    if (!title || !content || title === '' || content === '')
    throw new Meteor.Error("missing-field", "Un des champs est manquant.");

    // Edit news
    News.update({ _id: id }, { $set: {
      title: title,
      content: content,
      userId: Meteor.userId()
    }});
  },
  deleteNews: function (id) {
    if (!Meteor.userId())
    throw new Meteor.Error("not-connected", "Vous n'êtes pas connecté.");

    if (!Roles.userIsInRole(Meteor.userId(), ['admin']))
    throw new Meteor.Error("not-allowed", "Vous ne pouvez pas faire ça.");

    // Delete news
    News.remove({ _id: id });
  },
  generateKey: function () {
    if (!Meteor.userId())
    throw new Meteor.Error("not-connected", "Vous n'êtes pas connecté.");

    if (!Roles.userIsInRole(Meteor.userId(), ['admin']))
    throw new Meteor.Error("not-allowed", "Vous ne pouvez pas faire ça.");

    // Generate key
    BetaKeys.insert({
      token: Random.hexString(64),
      used: false
    });
  },
  deleteKey: function (id) {
    if (!Meteor.userId())
    throw new Meteor.Error("not-connected", "Vous n'êtes pas connecté.");

    if (!Roles.userIsInRole(Meteor.userId(), ['admin']))
    throw new Meteor.Error("not-allowed", "Vous ne pouvez pas faire ça.");

    // Generate key
    BetaKeys.remove({ _id: id });
  }
});
