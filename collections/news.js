News = new Mongo.Collection("news");

var Schemas = {};

Schemas.News = new SimpleSchema({
  title: {
    type: String,
    label: "Titre",
    regEx: /^[a-z\u00C0-\u017F0-9A-Z_\s-]{2,255}$/
  },
  content: {
    type: String,
    label: "Contenu",
    min: 2
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

News.attachSchema(Schemas.News);
