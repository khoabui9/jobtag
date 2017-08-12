Offers = new Mongo.Collection("offers");

var Schemas = {};

Schemas.Step = new SimpleSchema({
  type: {
    type: String,
    label: "Type",
    allowedValues: [
      'application-sent',
      'application-answer',
      'application-reminder',
      'job-interview',
      'job-interview-answer',
      'job-interview-h24',
      'job-interview-reminder',
      'hired',
      'finished'
    ]
  },
  date: {
    type: Date,
    label: "Date",
    optional: true
  },
  answer: {
    type: String,
    label: "Réponse",
    optional: true
  }
});

Schemas.Timeline = new SimpleSchema({
  steps: {
    type: [Schemas.Step],
    label: "Etapes",
  },
  current: {
    type: Schemas.Step,
    label: "Etape courante",
  }
});

Schemas.Documents = new SimpleSchema({
  resumeId: {
    type: String,
    label: "Identifiant du CV",
    optional: true
  },
  coveringLetterId: {
    type: String,
    label: "Identifiant de la lettre de motivation",
    optional: true
  }
});

Schemas.Begin = new SimpleSchema({
  date: {
    type: Date,
    label: "Date",
    optional: true
  },
  asap: {
    type: Boolean,
    label: "ASAP",
    defaultValue: false
  }
});

Schemas.Contact = new SimpleSchema({
  name: {
    type: String,
    label: "Nom",
    regEx: /^[A-Za-z\u00C0-\u017F\s-]{2,128}$/,
    optional: true
  },
  situation: {
    type: String,
    label: "Position",
    regEx: /^[a-z\u00C0-\u017F0-9A-Z_\&\@\(\)\[\]\\\/\'\"\s-]{1,128}$/
  },
  phone: {
    type: String,
    label: "Téléphone",
    regEx: /^[0-9_\+\(\)\s-]{2,64}$/,
    optional: true
  },
  email: {
    type: String,
    label: "Email",
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  information: {
    type: String,
    label: "Informations",
    max: 1024,
    optional: true
  }
});

Schemas.Location = new SimpleSchema({
  fullAddress: {
    type: String,
    label: "Adresse complète",
  },
  city: {
    type: String,
    label: "Ville",
    optional: true
  },
  country: {
    type: String,
    label: "Pays",
  }
});

Schemas.Offer = new SimpleSchema({
  title: {
    type: String,
    label: "Titre",
    regEx: /^[a-z\u00C0-\u017F0-9A-Z_\&\@\(\)\[\]\\\/\'\"\.\,\:\;\s-]{2,255}$/
  },
  company: {
    type: String,
    label: "Société",
    regEx: /^[a-z\u00C0-\u017F0-9A-Z_\&\@\(\)\[\]\\\/\'\"\.\,\:\;\s-]{1,255}$/
  },
  type: {
    type: String,
    label: "Type",
    regEx: /^[a-zA-Z_\s-]{2,100}$/,
    allowedValues: ['internship', 'alternating', 'limited', 'permanent', 'other']
  },
  rating: {
    type: Number,
    label: "Notation",
    min: 0,
    max: 5,
    defaultValue: 0,
    optional: true
  },
  source: {
    type: String,
    label: "Source",
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  location: {
    type: Schemas.Location,
    label: "Localisation",
    optional: true
  },
  timeline: {
    type: Schemas.Timeline,
    label: "Timeline"
  },
  contacts: {
    type: [Schemas.Contact],
    label: "Contacts",
    optional: true
  },
  status: {
    type: String,
    label: "Statut",
    allowedValues: ['opened', 'archived'],
    defaultValue: 'opened'
  },
  description: {
    type: String,
    label: "Description",
    min: 2
  },
  comment: {
    type: String,
    label: "Commentaires",
    min: 2,
    optional: true
  },
  begin: {
    type: Schemas.Begin,
    label: "Début",
    defaultValue: {
      asap: false
    }
  },
  documents: {
    type: Schemas.Documents,
    label: "Documents",
    optional: true
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
  directoryId: {
    type: String,
    label: "Identifiant du dossier",
    optional: true
  },
  userId: {
    type: String,
    label: "Identifiant utilisateur"
  }
});

Offers.attachSchema(Schemas.Offer);

// File system collections for resumes and covering letters
var resumeStore = new FS.Store.FileSystem("resumeStore", {
  path: "uploads/resumes",
});
Resumes = new FS.Collection("resumes", {
  stores: [resumeStore],
  filter: {
    maxSize: 2621440, // allow only 2.5Mo
    allow: {
      contentTypes: ['application/pdf'], // allow only pdf file
      extensions: ['pdf'] // allow only pdf extension
    }
  }
});
Resumes.allow({
  insert: function (userId, resume) {
    return userId;
  },
  update: function (userId, resume, fields, modifier) {
    return resume.ownerId === userId;
  },
  download: function(userId, resume) {
    return resume.ownerId === userId;
  }
});
Resumes.deny({
  insert: function (userId, resume) {
    return resume.ownerId !== userId;
  }
});

var coveringLetterStore = new FS.Store.FileSystem("coveringLetterStore", {
  path: "uploads/covering-letters",
});
CoveringLetters = new FS.Collection("coveringLetters", {
  stores: [coveringLetterStore],
  filter: {
    maxSize: 2621440, // allow only 2.5Mo
    allow: {
      contentTypes: ['application/pdf'], // allow only pdf file
      extensions: ['pdf'] // allow only pdf extension
    }
  }
});
CoveringLetters.allow({
  insert: function (userId, coveringLetter) {
    return userId;
  },
  update: function (userId, coveringLetter, fields, modifier) {
    return coveringLetter.ownerId === userId;
  },
  download: function(userId, coveringLetter) {
    return coveringLetter.ownerId === userId;
  }
});
CoveringLetters.deny({
  insert: function (userId, coveringLetter) {
    return coveringLetter.ownerId !== userId;
  }
});
