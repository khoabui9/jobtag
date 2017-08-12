Meteor.methods({
  addOffer: function (title, company, type, rating, source, directory, begin, description, comment) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    var dir = Directories.findOne({ _id: directory });
    if (directory != 'none' && dir.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");

    var beginObj = { asap: false };
    if (begin.toLowerCase() === 'asap')
    beginObj.asap = true;
    else if (begin !== '')
    beginObj.date = moment(begin, 'DD/MM/YYYY').toDate();

    if (rating === null) {
      rating = 0;
    }

    // Insert new offer
    if (directory != 'none')
    return Offers.insert({
      title: title,
      company: company,
      type: type,
      rating: rating,
      source: source,
      begin: beginObj,
      description: description,
      comment: comment,
      timeline: {
        current: {
          type: 'application-sent'
        },
        steps: []
      },
      createdAt: new Date(),
      directoryId: directory,
      userId: Meteor.userId()
    });
    else
    return Offers.insert({
      title: title,
      company: company,
      type: type,
      rating: rating,
      source: source,
      begin: beginObj,
      description: description,
      comment: comment,
      timeline: {
        current: {
          type: 'application-sent'
        },
        steps: []
      },
      createdAt: new Date(),
      userId: Meteor.userId()
    });
  },
  editOffer: function (id, title, company, type, rating, source, directory, begin, description, comment, location) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    var offer = Offers.findOne({ _id: id });
    if (offer.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");

    var dir = Directories.findOne({ _id: directory });
    if (directory != 'none' && dir.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");

    var beginObj = { asap: false };
    if (begin.toLowerCase() === 'asap')
    beginObj.asap = true;
    else if (begin !== '')
    beginObj.date = moment(begin, 'DD/MM/YYYY').toDate();

    // Location
    var locationObj;
    if (location) {
      locationObj = {};
      locationObj.fullAddress = location.formatted_address;
      _.each(location.address_components, function (address_component) {
        if (address_component.types[0] == "locality")
        locationObj.city = address_component.long_name;
        if (address_component.types[0] == "country")
        locationObj.country = address_component.long_name;
      });
    }

    // Update offer
    if (directory != 'none')
    Offers.update({ _id: id }, { $set: {
      title: title,
      company: company,
      type: type,
      rating: rating,
      source: source,
      begin: beginObj,
      description: description,
      comment: comment,
      location: locationObj,
      updatedAt: new Date(),
      directoryId: directory,
    }});
    else {
      Offers.update({ _id: id }, { $set: {
        title: title,
        company: company,
        type: type,
        rating: rating,
        source: source,
        begin: beginObj,
        description: description,
        comment: comment,
        location: locationObj,
        updatedAt: new Date(),
      }});
      Offers.update({ _id: id }, { $unset: { directoryId: 1 }});
    }

    if (!location)
    Offers.update({ _id: id }, { $unset: { location: 1 }});
  },
  deleteOffer: function (id) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    var offer = Offers.findOne({ _id: id });
    if (offer.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");

    // Delete documents
    if (offer.documents && offer.documents.resumeId)
    Resumes.remove({ _id: offer.documents.resumeId });
    if (offer.documents && offer.documents.coveringLetterId)
    CoveringLetters.remove({ _id: offer.documents.coveringLetterId });

    // Delete offer
    Offers.remove({ _id: id });
  },
  changeOfferResume: function (id, resumeId) {
    var offer = Offers.findOne({ _id: id });
    var resume = Resumes.findOne({ _id: resumeId });
    if (!Meteor.userId() || offer.userId != Meteor.userId()) {
      // Delete the created file with id: resumeId
      Resumes.remove({ _id: resumeId });

      // Throw appropriate error
      if (!Meteor.userId())
      throw new Meteor.Error("Vous n'êtes pas connecté.");
      if (offer.userId != Meteor.userId())
      throw new Meteor.Error("Vous ne pouvez pas faire ça.");
    } else {
      // Remove last resume if existing
      if (offer.documents && typeof offer.documents.resumeId != 'undefined')
      Resumes.remove({ _id: offer.documents.resumeId });

      // Update offer with the new resumeId
      Offers.update({ _id: id }, { $set: {
        'documents.resumeId': resumeId,
      }});
    }
  },
  changeOfferCoveringLetter: function (id, coveringLetterId) {
    var offer = Offers.findOne({ _id: id });
    var coveringLetter = CoveringLetters.findOne({ _id: coveringLetterId });
    if (!Meteor.userId() || offer.userId != Meteor.userId()) {
      // Delete the created file with id: resumeId
      CoveringLetters.remove({ _id: coveringLetterId });

      // Throw appropriate error
      if (!Meteor.userId())
      throw new Meteor.Error("Vous n'êtes pas connecté.");
      if (offer.userId != Meteor.userId())
      throw new Meteor.Error("Vous ne pouvez pas faire ça.");
    } else {
      // Remove last resume if existing
      if (offer.documents && typeof offer.documents.coveringLetterId != 'undefined')
      CoveringLetters.remove({ _id: offer.documents.coveringLetterId });

      // Update offer with the new resumeId
      Offers.update({ _id: id }, { $set: {
        'documents.coveringLetterId': coveringLetterId,
      }});
    }
  },
  archiveOffer: function (id) {
    var offer = Offers.findOne({ _id: id });

    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");
    if (offer.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");

    // Set to archived
    Offers.update({ _id: id }, { $set: {
      'status': 'archived',
    }});
  },
  addContact: function (id, name, situation, phone, email, information) {
    var offer = Offers.findOne({ _id: id });

    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");
    if (offer.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");

    // Insert new contact
    return Offers.update({ _id : id }, { $push: { 'contacts': {
      name: name,
      situation: situation,
      phone: phone,
      email: email,
      information: information
    }}});
  },
  editContact: function (id, index, name, situation, phone, email, information) {
    var offer = Offers.findOne({ _id: id });

    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");
    if (offer.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");

    var set = { $set: {} };
    set['$set']['contacts.' + index] = {
      name: name,
      situation: situation,
      phone: phone,
      email: email,
      information: information
    };

    // Update contact
    return Offers.update({ _id : id }, set);
  },
  removeContact: function (id, index) {
    var offer = Offers.findOne({ _id: id });

    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");
    if (offer.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");

    var unset = { $unset: {} };
    unset['$unset']['contacts.' + index] = 1;

    // Remove contact
    Offers.update({ _id : id }, unset);
    Offers.update({ _id : id }, { $pull: { 'contacts': null }});
  },
});
