BetaKeys = new Mongo.Collection("betakeys");

var Schemas = {};

Schemas.BetaKey = new SimpleSchema({
  token: {
    type: String,
    label: "Token",
    unique: true
  },
  used: {
    type: Boolean,
    label: "Utilisation"
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
  usedAt: {
    type: Date,
    label: "Date d'utilisation",
    optional: true,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date;
      } else {
        this.unset();
      }
    }
  }
});

BetaKeys.attachSchema(Schemas.BetaKey);
