Meteor.subscribe('offers');
Meteor.subscribe('resumes');
Meteor.subscribe('coveringLetters');

Template.offers.helpers({
  offers: function () {
    var search = Session.get('search');
    var archives = Session.get('archives');
    var type = Session.get('offers.order.type');
    var sortBy;
    switch (Session.get('offers.order')) {
      case 'title':
      sortBy = { title: type == 'asc' ? 1 : -1 };
      break;
      case 'company':
      sortBy = { company: type == 'asc' ? 1 : -1 };
      break;
      case 'location':
      sortBy = { 'location.city': type == 'asc' ? 1 : -1, 'location.country': type == 'asc' ? 1 : -1 };
      break;
      default:
      sortBy = { createdAt: type == 'asc' ? 1 : -1 };
    }
    if (search && search !== '')
    return Offers.find({ $or: [ { "title": { $regex: ".*" + search + ".*" }, userId: Meteor.userId() }, { "company": { $regex: ".*" + search + ".*" }, userId: Meteor.userId() } ] }, { sort: sortBy });
    else if (archives)
    return Offers.find({ status: 'archived', userId: Meteor.userId() }, { sort: sortBy });
    else if (Session.get('directory.selected') === 'all-offers')
    return Offers.find({ status: { $ne: 'archived' }, userId: Meteor.userId() }, { sort: sortBy });
    else
    return Offers.find({ status: { $ne: 'archived' }, directoryId: Session.get('directory.selected'), userId: Meteor.userId() }, { sort: sortBy });
  },
  offersOrders: function () {
    return [
      { name: 'Titre', id: 'title' },
      { name: 'Société', id: 'company' },
      { name: 'Localisation', id: 'location' },
      { name: 'Date de création', id: 'date' }
    ];
  },
  offersOrderType: function () {
    if (Session.get('offers.order.type') === 'asc')
    return '<i class="fa fa-long-arrow-up"></i>';
    else
    return '<i class="fa fa-long-arrow-down"></i>';
  }
});

Template.offers.events({
  'click #offers-order-type': function (e, t) {
    if (Session.get('offers.order.type') === 'asc')
    Session.set('offers.order.type', 'desc');
    else
    Session.set('offers.order.type', 'asc');
  },
});

Template.offersOrder.helpers({
  active: function () {
    if (this.id === Session.get('offers.order'))
    return 'active';
  }
});

Template.offersOrder.events({
  'click li': function (e, t) {
    Session.set('offers.order', this.id);
  }
});

Template.offerItem.events({
  'click li': function (e, t) {
    /*Session.set('directory.selected', this.directoryId);*/
    Router.go('offer', { _id: this._id });
  }
});

Template.offerItem.helpers({
  active: function () {
    return Router.current().params._id == this._id;
  },
  loopCount: function(count){
    var countArr = [];
    for (var i=0; i<count; i++){
      countArr.push({});
    }
    return countArr;
  },
  starify: function (count) {
    var html = '';
    for (var i = 0; i < 5; i++) {
      if (i <= count - 1)
      html += '<i class="fa fa-star"></i>';
      else
      html += '<i class="fa fa-star-o"></i>';
    }
    return html;
  },
  formattedLocation: function () {
    if (this.location) {
      if (this.location.city)
      return this.location.city + ", " + this.location.country;
      else
      return this.location.country;
    } else {
      return "NC";
    }
  }
});

Template.newOffer.rendered = function () {
  var selectedDirectory = Session.get('directory.selected');
  $('#new-offer-directory option[value=' + selectedDirectory + ']').attr('selected', 'selected');

  $('#new-offer-rating').raty({
    cancel   : true,
    starType : 'i',
    hints: ['1', '2', '3', '4', '5'],
    scoreName: 'rating',
    starOff: 'fa fa-star-o',
    starOn: 'fa fa-star',
    cancelOff: 'fa fa-times-circle-o',
    cancelOn: 'fa fa-times-circle',
    cancelPlace: 'right',
    cancelClass: 'cancel'
  });

  $('#new-offer-begin').datepicker({
    format: "dd/mm/yyyy",
    language: "fr",
    orientation: "top auto"
  });

  $('#new-offer-begin-asap').click(function () {
    $('#new-offer-begin').val('ASAP');
  })

  var params = Router.current().params.query;
  if (params.title)
  $('#new-offer-title').val(params.title);
  if (params.company)
  $('#new-offer-company').val(params.company);
  if (params.type)
  $('#new-offer-type').val(params.type);
  if (params.source)
  $('#new-offer-source').val(params.source);
  if (params.description)
  $('#new-offer-description').val(params.description);
  if (params.comment)
  $('#new-offer-comment').val(params.comment);
};

Template.newOffer.events({
  'submit #new-offer-form': function (e, t) {
    e.preventDefault();

    // Data retrieval
    var title = t.find('#new-offer-title').value;
    var company = t.find('#new-offer-company').value;
    var type = t.find('#new-offer-type option:selected').value;
    var rating = $('#new-offer-rating').raty('score');
    var source = t.find('#new-offer-source').value;
    var directory = t.find('#new-offer-directory option:selected').value;
    var begin = t.find('#new-offer-begin').value;
    var description = t.find('#new-offer-description').value;
    var comment = t.find('#new-offer-comment').value;

    Meteor.call('addOffer', title, company, type, rating, source, directory, begin, description, comment, function (error, result) {
      if (error) {
        Notifications.error('Erreur', error.message);
      } else {
        Notifications.success('Terminé', 'Votre nouvelle offre \'' + title + '\' a bien été créée.');
        Router.go('/offers/' + result);
      }
    });
  }
});

Template.newOffer.helpers({
  directories: function () {
    return Directories.find({ userId: Meteor.userId() });
  },
  none: function () {
    return typeof Session.get('directory.selected') == 'undefined' || Session.get('directory.selected') == 'all-offers';
  }
});

Template.directorySelect.helpers({
  selected: function () {
    return Session.get('directory.selected') == this._id;
  },
});

Template.offer.rendered = function () {
  $('#offer-edit-begin').datepicker({
    format: "dd/mm/yyyy",
    language: "fr",
    orientation: "top right"
  });

  $('#offer-edit-begin-asap').click(function () {
    $('#offer-edit-begin').val('ASAP');
  })

  $('body').removeClass('notfound');
};

Template.offer.helpers({
  directories: function () {
    return Directories.find({ userId: Meteor.userId() });
  },
  existing: function (element) {
    return element ? element : 'NC';
  },
  edited: function (edited) {
    return Session.get('offer.edited') ? 'edited' : '';
  },
  edit: function () {
    return Session.get('offer.edited') ? '' : 'hide';
  },
  hideEdit: function () {
    return Session.get('offer.edited') ? 'hide' : '';
  },
  starify: function (count) {
    var html = '';
    for (var i = 0; i < 5; i++) {
      if (i != 0)
      html += '&nbsp;';

      if (i <= count - 1)
      html += '<i class="fa fa-star"></i>';
      else
      html += '<i class="fa fa-star-o"></i>';
    }
    return html;
  },
  offer: function () {
    var offer = Offers.findOne({ _id: Router.current().params._id });

    if (offer) {
      switch (offer.type) {
        case 'permanent':
        offer.type = 'CDI'
        break;
        case 'limited':
        offer.type = 'CDD'
        break;
        case 'alternating':
        offer.type = 'Alternance'
        break;
        case 'internship':
        offer.type = 'Stage'
        break;
        default:
        offer.type = 'Autre';
      }

      if (offer.documents) {
        offer.documents.resume = Resumes.findOne({ _id: offer.documents.resumeId });
        offer.documents.coveringLetter = CoveringLetters.findOne({ _id: offer.documents.coveringLetterId });
      }
    }

    return offer;
  },
  offerBegin: function () {
    var offer = Offers.findOne({ _id: Router.current().params._id });
    if (offer) {
      if (offer.begin.asap)
      return 'ASAP';
      if (offer.begin.date)
      return moment(offer.begin.date).format('DD/MM/YYYY');
    }
  },
  timelineStep: function (step) {
    var offer = Offers.findOne({ _id: Router.current().params._id });
    var last;
    if (offer.timeline.steps.length > 0)
    last = _.sortBy(offer.timeline.steps, function (step) { return step.date }).reverse()[0];
    var sent = _.find(offer.timeline.steps, function (step) { return step.type == 'application-sent'; });
    switch (step) {
      case 'sent':
      return sent ? sent.answer === 'yes' ? 'node-success' : 'node-danger' : 'node-progress';
      break;
      case 'wait':
      if (!last)
      return '';
      else if (offer.timeline.current.type === 'finished') {
        var answer = _.find(offer.timeline.steps, function (step) { return step.type == 'application-answer'; });
        if (sent.answer == 'yes' && answer.answer.indexOf('yes') > -1)
        return 'node-success';
        else
        return 'node-danger';
      } else if (last.type === 'application-sent' || last.type == 'application-reminder')
      return 'node-progress';
      else
      return 'node-success';
      break;
      case 'interview':
      var interview = _.find(offer.timeline.steps, function (step) { return step.type.indexOf("job-interview") > -1; })
      if (offer.timeline.current.type === 'finished') {
        if (interview) {
          var answer = _.find(offer.timeline.steps, function (step) { return step.type === "job-interview-answer"; });
          if (answer && answer.answer == 'no')
          return 'node-danger';
          else
          return 'node-success';
        }
        else
        return 'node-danger';
      } else if (interview)
      return 'node-progress'
      break;
      case 'done':
      if (offer.timeline.current.type === 'finished')
      return 'node-success'
      break;
      default:
      return '';
    }

    return '';
  },
  contactsEdited: function () {
    return Session.get('offer.contacts.edited');
  },
  contacts: function () {
    var offer = Offers.findOne({ _id: Router.current().params._id });
    var contacts = offer.contacts;
    var index = 0;
    _.each(contacts, function (contact) {
      contact.id = index++;
    });

    return contacts;
  }
});

function uploadResume (e, t) {
  FS.Utility.eachFile(e, function (file) {
    var fsFile = new FS.File(file);
    fsFile.ownerId = Meteor.userId();
    Resumes.insert(fsFile, function (error, fileObj) {
      if (!error)
      Meteor.call('changeOfferResume', Router.current().params._id, fileObj._id, function (error) {
        if (error) {
          Notifications.error('Erreur', error.message);
        } else {
          Notifications.success('Terminé', 'Votre CV est bien enregistré.');
        }
      });
      else if (error.message === 'FS.Collection insert: file does not pass collection filters')
      Notifications.error('Erreur', 'Veuillez vérifier le format et la taille de votre fichier.');
      else
      Notifications.error('Erreur', error.message);
    });
  });
}

function uploadCoveringLetter (e, t) {
  FS.Utility.eachFile(e, function (file) {
    var fsFile = new FS.File(file);
    fsFile.ownerId = Meteor.userId();
    CoveringLetters.insert(fsFile, function (error, fileObj) {
      if (!error)
      Meteor.call('changeOfferCoveringLetter', Router.current().params._id, fileObj._id, function (error) {
        if (error) {
          Notifications.error('Erreur', error.message);
        } else {
          Notifications.success('Terminé', 'Votre lettre de motivation est bien enregistrée.');
        }
      });
      else if (error.message === 'FS.Collection insert: file does not pass collection filters')
      Notifications.error('Erreur', 'Veuillez vérifier le format et la taille de votre fichier.');
      else
      Notifications.error('Erreur', error.message);
    });
  });
}

Template.offer.events({
  'click #offer-edit': function (e, t) {
    var offer = Offers.findOne({ _id: Router.current().params._id });

    $('#offer-edit-rating').raty({
      cancel: true,
      score: offer.rating,
      starType : 'i',
      hints: ['1', '2', '3', '4', '5'],
      scoreName: 'rating',
      starOff: 'fa fa-star-o',
      starOn: 'fa fa-star',
      cancelOff: 'fa fa-times-circle-o',
      cancelOn: 'fa fa-times-circle',
      cancelPlace: 'left',
      cancelClass: 'cancel'
    });
    $('#offer-edit-type option[value=' + offer.type + ']').attr('selected', 'selected');
    $('#offer-edit-directory option[value=' + offer.directoryId + ']').attr('selected', 'selected');

    input = document.getElementById('offer-edit-location');
    if (input)
    offerLocation = new google.maps.places.Autocomplete(input);

    Session.set('offer.edited', true);
  },
  'click #offer-delete': function (e, t) {
    var self = this;
    bootbox.confirm("Êtes-vous certain de vouloir supprimer cette offre ?", function(confirmed) {
      if (confirmed) {
        Meteor.call('deleteOffer', Router.current().params._id, function (error) {
          if (error) {
            Notifications.error('Erreur', error.message);
          } else {
            Notifications.success('Terminé', 'Votre offre a bien été supprimée.');
            Router.go('home');
          }
        });
      }
    });
  },
  'click #offer-edit-cancel': function (e, t) {
    var offer = Offers.findOne({ _id: Router.current().params._id });

    $('#offer-edit-rating').raty({
      readOnly: true,
      score: offer.rating,
      starType : 'i',
      hints: ['1', '2', '3', '4', '5'],
      scoreName: 'rating',
      starOff: 'fa fa-star-o',
      starOn: 'fa fa-star',
    });

    Session.set('offer.edited', false);
  },
  'click #offer-edit-validate': function (e, t) {
    // Data retrieval
    var title = t.find('#offer-edit-title').value;
    var company = t.find('#offer-edit-company').value;
    var type = t.find('#offer-edit-type option:selected').value;
    var rating = t.find('#offer-edit-rating input').value;
    var source = t.find('#offer-edit-source').value;
    var directory = t.find('#offer-edit-directory option:selected').value;
    var begin = t.find('#offer-edit-begin').value;
    var description = t.find('#offer-edit-description').value;
    var comment = t.find('#offer-edit-comment').value;
    var location = t.find('#offer-edit-location').value;

    // Find location components
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location }, function (results, status) {
      var locationResult;
      if (location === '' || status == google.maps.GeocoderStatus.OK) {
        if (status == google.maps.GeocoderStatus.OK)
        locationResult = _.first(results);

        Meteor.call('editOffer', Router.current().params._id, title, company, type, rating, source, directory, begin, description, comment, locationResult, function (error) {
          if (error) {
            Notifications.error('Erreur', error.message);
          } else {
            Notifications.success('Terminé', 'Votre offre \'' + title + '\' a bien été éditée.');
            Session.set('offer.edited', false);

            $('#offer-edit-rating').raty({
              readOnly: true,
              score: rating,
              starType : 'i',
              hints: ['1', '2', '3', '4', '5'],
              scoreName: 'rating',
              starOff: 'fa fa-star-o',
              starOn: 'fa fa-star',
            });
          }
        });
      } else {
        Notifications.error('Erreur', 'Adresse incorrecte.');
      }
    });
  },
  'change #offer-resume-input': function(e, t) {
    uploadResume(e, t);
  },
  'change #offer-covering-input': function(e, t) {
    uploadCoveringLetter(e, t);
  },
  'dropped .dropzone': function (e, t) {
    // Resume
    if (e.currentTarget.id == "offer-resume-dropzone") {
      uploadResume(e, t);
    }
    // Covering letter
    else if (e.currentTarget.id == "offer-covering-dropzone") {
      uploadCoveringLetter(e, t);
    }
  },
  'click #offer-contacts-add': function (e, t) {
    var contact = {}
    Session.set('offer.contacts.edited', contact);
  },
  'click #offer-contacts-edit': function (e, t) {
    var id = e.currentTarget.dataset.id;
    var offer = Offers.findOne({ _id: Router.current().params._id });
    var contact = offer.contacts[id];
    contact.id = id;
    Session.set('offer.contacts.edited', contact);
  },
  'click #offer-contacts-delete': function (e, t) {
    var id = e.currentTarget.dataset.id;
    bootbox.confirm("Êtes-vous certain de vouloir supprimer ce contact ?", function(confirmed) {
      if (confirmed) {
        Meteor.call('removeContact', Router.current().params._id, id, function (error) {
          if (error) {
            Notifications.error('Erreur', error.message);
          } else {
            Notifications.success('Terminé', 'Contact supprimé.');
            Session.set('offer.contacts.edited');
          }
        });
      }
    });
  },
  'click #offer-contacts-cancel': function (e, t) {
    Session.set('offer.contacts.edited');
  },
  'click #offer-contacts-validate': function (e, t) {
    var id = Session.get('offer.contacts.edited').id;

    var name = t.find('#offer-contacts-name').value || null;
    var situation = t.find('#offer-contacts-situation').value || null;
    var phone = t.find('#offer-contacts-phone').value || null;
    var email = t.find('#offer-contacts-email').value || null;
    var information = t.find('#offer-contacts-information').value || null;

    if (id) {
      Meteor.call('editContact', Router.current().params._id, id, name, situation, phone, email, information, function (error) {
        if (error) {
          Notifications.error('Erreur', error.message);
        } else {
          Notifications.success('Terminé', 'Contact modifié.');
          Session.set('offer.contacts.edited');
        }
      });
    } else {
      Meteor.call('addContact', Router.current().params._id, name, situation, phone, email, information, function (error) {
        if (error) {
          Notifications.error('Erreur', error.message);
        } else {
          Notifications.success('Terminé', 'Un nouveau contact a été enregistré.');
          Session.set('offer.contacts.edited');
        }
      });
    }
  }
})
