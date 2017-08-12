Directories = new Mongo.Collection("directories");

var Schemas = {};

Schemas.Directory = new SimpleSchema({
  name: {
    type: String,
    label: "Nom",
    regEx: /^[a-z\u00C0-\u017F0-9A-Z_\s-]{2,32}$/,
    max: 100
  },
  createdAt: {
    type: Date,
    label: "Date de création",
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();
      }
    }
  },
  updatedAt: {
    type: Date,
    label: "Date de modification",
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  },
  userId: {
    type: String,
    label: "Identifiant utilisateur"
  }
});

Directories.attachSchema(Schemas.Directory);
