Schema = {};

Schema.UserCountry = new SimpleSchema({
  name: {
    type: String
  },
  code: {
    type: String,
    regEx: /^[A-Z]{2}$/
  }
});

Schema.UserProfile = new SimpleSchema({
  firstName: {
    type: String,
    regEx: /^[A-Za-z\u00C0-\u017F\s-]{2,32}$/,
  },
  lastName: {
    type: String,
    regEx: /^[A-Za-z\u00C0-\u017F\s-]{2,64}$/,
  },
  birthday: {
    type: Date,
    optional: true
  },
  gender: {
    type: String,
    allowedValues: ['Male', 'Female'],
    optional: true
  },
  organization : {
    type: String,
    regEx: /^[a-z0-9A-z .]{3,30}$/,
    optional: true
  },
  website: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  bio: {
    type: String,
    optional: true
  },
  country: {
    type: Schema.UserCountry,
    optional: true
  }
});

Schema.User = new SimpleSchema({
  username: {
    type: String,
    regEx: /^[a-z0-9.-]{3,24}$/
  },
  emails: {
    type: [Object],
    // this must be optional if you also use other login services like facebook,
    // but if you use only accounts-password, then it can be required
    optional: true
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean
  },
  betaKeyId: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date
  },
  profile: {
    type: Schema.UserProfile,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  // Using meteor-roles package without groups
  roles: {
    type: [String],
    optional: true
  }
});

Meteor.users.attachSchema(Schema.User);
