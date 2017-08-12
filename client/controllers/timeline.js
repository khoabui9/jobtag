Template.timeline.helpers({
  timeline: function () {
    var offer = Offers.findOne({ _id: Router.current().params._id });
    var timeline;

    if (offer) {
      timeline = offer.timeline;

      // Current
      switch (timeline.current.type) {
        case 'application-sent':
        timeline.current.question = 'Avez-vous envoyé votre candidature ?';
        timeline.current.answers = [
          { name: 'Oui', id: 'application-sent-yes', class: 'btn btn-default' },
          { name: 'Non', id: 'application-sent-no', class: 'btn btn-default' }
        ];
        break;
        case 'application-answer':
        var applicationSent = _.find(timeline.steps, function(step) { return step.type === 'application-sent'; });
        timeline.current.question = 'Vous avez envoyé votre candidature ' + moment(applicationSent.date).fromNow();
        timeline.current.question += ', quelle réponse avez-vous eu ?';
        timeline.current.answers = [
          { name: 'Réponse positive', id: 'application-answer-yes-good', class: 'btn btn-default' },
          { name: 'Réponse négative', id: 'application-answer-yes-bad', class: 'btn btn-default' },
          { name: 'Je n\'ai pas reçu de réponse', id: 'application-answer-no', class: 'btn btn-default' }
        ];
        break;
        case 'job-interview-answer':
        var jobInterview = _.find(timeline.steps, function(step) { return step.type === 'job-interview'; });
        timeline.current.question = 'Votre entretien est programmé ' + moment(jobInterview.date).fromNow() + '.';
        if (jobInterview.date < new Date) {
          timeline.current.question = 'Comment s\'est déroulé votre entretien ?';
          timeline.current.answers = [
            { name: 'Réponse positive', id: 'job-interview-answer-yes-good', class: 'btn btn-default' },
            { name: 'Réponse négative', id: 'job-interview-answer-yes-bad', class: 'btn btn-default' },
            { name: 'Je n\'ai pas reçu de réponse', id: 'job-interview-answer-no', class: 'btn btn-default' },
            { name: 'Nouvel entretien', id: 'job-interview-answer-yes-interview', class: 'btn btn-default' }
          ];
        }
        break;
        default:
        timeline.current.question = 'Candidature terminée';
      }

      // Steps
      // - Add extra info
      timeline.steps.map(function(step, index, cursor) {
        switch (step.type) {
          case 'application-sent':
          step.titleIcon = 'paper-plane';
          if (step.answer === 'yes') {
            step.name = 'Candidature envoyée';
            step.badgeIcon = 'check';
            step.status = 'success'
          } else {
            step.name = 'Candidature non envoyée';
            step.badgeIcon = 'times';
            step.status = 'danger'
          }
          break;
          case 'application-reminder':
          var sent = moment(step.date).add(step.answer, 'days').toDate();
          if (sent < new Date) {
            step.name = 'Mail de rappel de relance de candidature envoyé';
            step.badgeIcon = 'check';
            step.titleIcon = 'paper-plane';
            step.status = 'success'
          } else {
            step.name = 'Mail de rappel de relance de candidature programmé';
            step.badgeIcon = 'refresh';
            step.titleIcon = 'calendar';
            step.status = 'info'
            step.date = sent;
          }
          break;
          case 'application-answer':
          step.badgeIcon = 'check';
          step.titleIcon = 'question';
          step.status = 'success'
          if (step.answer === 'no') {
            step.name = 'Pas de réponse : clotûre';
          } else if (step.answer === 'yes-bad') {
            step.name = 'Refus de candidature : clotûre';
          } else {
            step.name = 'Réponse favorable à la candidature.';
          }
          break;
          case 'job-interview':
          step.name = 'Entretien'
          step.titleIcon = 'user';
          var jobInterview = _.find(timeline.steps, function(step) { return step.type === 'job-interview'; });
          if (jobInterview.date < new Date) {
            step.badgeIcon = 'check';
            step.status = 'success'
          } else {
            step.badgeIcon = 'refresh';
            step.titleIcon = 'user';
            step.status = 'info'
          }
          break;
          case 'job-interview-answer':
          step.badgeIcon = 'check';
          step.titleIcon = 'question';
          step.status = 'success'
          if (step.answer === 'no') {
            step.name = 'Pas de réponse : clotûre';
          } else if (step.answer === 'yes-bad') {
            step.name = 'Refus de candidature : clotûre';
          } else if (step.answer === 'yes-interview') {
            step.name = 'Demande d\'un autre entretien.';
          } else {
            step.name = 'Réponse favorable à la candidature.';
          }
          break;
          case 'job-interview-reminder':
          var sent = moment(step.date).add(step.answer, 'days').toDate();
          if (sent < new Date) {
            step.name = 'Mail de rappel de relance de réponse à l\'entretien envoyé';
            step.badgeIcon = 'check';
            step.titleIcon = 'paper-plane';
            step.status = 'success'
          } else {
            step.name = 'Mail de rappel de relance de réponse à l\'entretien programmé';
            step.badgeIcon = 'refresh';
            step.titleIcon = 'calendar';
            step.status = 'info'
            step.date = sent;
          }
          break;
          default:
          step.name = 'Etape inconnue';
        }
        return step;
      });

      // - Reorder
      timeline.steps = _.sortBy(timeline.steps, function (step) { return step.date }).reverse();

      // - Add index
      var index = 0;
      timeline.steps.map(function(step, index, cursor) {
        step._index = index++;
        return step;
      });
    }

    return timeline;
  },
  even: function () {
    return (this._index % 2) === 0;
  }
});

function scheduleReminderModal(method, days, callback) {
  var buttons = {};
  _.each(days, function (day) {
    buttons['days' + day] = {
      label: day + " jours",
      className: "btn-primary",
      callback: function () {
        Meteor.call(method, Router.current().params._id, day, function (error) {
          if (error) {
            Notifications.error('Erreur', error.message);
          } else {
            Notifications.success('Succès', 'Mail de rappel programmé.');
            callback();
          }
        });
      }
    }
  });
  buttons.noreminder = {
    label: "Ne pas programmer de rappel",
    className: "btn-primary",
    callback: function () {
      callback();
    }
  };

  bootbox.dialog({
    message: "Programmer une relance dans :",
    buttons: buttons
  });
}

function badAnswerArchiveModal(method) {
  bootbox.dialog({
    message: "Nous sommes désolés que votre demande n'ait pas aboutie. Voulez vous archiver l'offre ?",
    buttons: {
      yes: {
        label: "Oui",
        className: "btn-primary",
        callback: function () {
          Meteor.call(method, Router.current().params._id, 'yes-bad', new Date, function (error) {
            if (error) {
              Notifications.error('Erreur', error.message);
            } else {
              Notifications.success('Succès', 'Une nouvelle étape est validée.');
              Meteor.call('archiveOffer', Router.current().params._id, function (error) {
                if (error) {
                  Notifications.error('Erreur', error.message);
                } else {
                  Notifications.success('Succès', 'Votre offre est maintenant archivée.');
                }
              });
            }
          });
        }
      },
      cancel: {
        label: "Annuler",
        className: "btn-primary"
      }
    }
  });
}

function jobInterviewScheduleModal(method, answer) {
  var message = "";
  if (answer === 'yes-good')
  message = "<p>Félicitations, vous êtes en bonne voie. Programmer un entretien :</p>";
  else if (answer === 'yes-interview')
  message = "<p>Programmer un entretien :</p>";
  message += "<form action=\"action\">"
  + "<input id=\"job-interview-modal-datetime\" class=\"form-control\" type=\"text\" name=\"datetime\" placeholder=\"Sélectionner une date et une heure\"/>"
  + "</form>";
  var dialog = bootbox.dialog({
    message: message,
    buttons: {
      validate: {
        label: "Valider",
        className: "btn-primary",
        callback: function () {
          var datetime = $('#job-interview-modal-datetime').first().val();
          Meteor.call(method, Router.current().params._id, answer, datetime, function (error) {
            if (error) {
              Notifications.error('Erreur', error.message);
            } else {
              Notifications.success('Succès', 'Un entretien est programmé.');
              Notifications.success('Succès', 'Une nouvelle étape est validée.');
            }
          });
        }
      },
      cancel: {
        label: "Annuler",
        className: "btn-primary"
      }
    },
    show: false
  });
  dialog.on("shown.bs.modal", function() {
    $('#job-interview-modal-datetime').datetimepicker({
      format: "llll",
      showTodayButton: true,
      locale: "fr"
    });
  });
  dialog.modal("show");
}

Template.timeline.events({
  'click #application-sent-no': function (e, t) {
    bootbox.dialog({
      message: "Pour pouvoir continuer, vous devez envoyer votre candidature.",
      buttons: {
        ok: {
          label: "Ok",
          className: "btn-primary",
        },
        no: {
          label: "Non, je souhaite archiver cette offre",
          className: "btn-primary",
          callback: function () {
            bootbox.dialog({
              message: "Êtes-vous sûr de vouloir archiver cette offre ?",
              buttons: {
                yes: {
                  label: "Oui",
                  className: "btn-primary",
                  callback: function () {
                    Meteor.call('applicationSent', Router.current().params._id, 'no', new Date, function (error) {
                      if (error) {
                        Notifications.error('Erreur', error.message);
                      } else {
                        Notifications.success('Succès', 'Une nouvelle étape est validée.');
                        Meteor.call('archiveOffer', Router.current().params._id, function (error) {
                          if (error) {
                            Notifications.error('Erreur', error.message);
                          } else {
                            Notifications.success('Succès', 'Votre offre est maintenant archivée.');
                          }
                        });
                      }
                    });
                  }
                },
                cancel: {
                  label: "Annuler",
                  className: "btn-primary"
                }
              }
            });
          }
        }
      }
    });
  },
  'click #application-sent-yes': function (e, t) {
    scheduleReminderModal('scheduleApplicationReminderMail', [5, 10, 15], function () {
      Meteor.call('applicationSent', Router.current().params._id, 'yes', function (error) {
        if (error) {
          Notifications.error('Erreur', error.message);
        } else {
          Notifications.success('Succès', 'Une nouvelle étape est validée.');
        }
      });
    });
  },
  'click #application-answer-no': function (e, t) {
    var steps = Offers.findOne({ _id: Router.current().params._id }).timeline.steps;
    var applicationReminders = _.filter(steps, function (step) {
      return step.type === 'application-reminder';
    });
    if (applicationReminders.length > 0) {
      var last = _.last(_.filter(applicationReminders, function (step) {
        return step.date;
      }));
      last.sent = moment(last.date).add(last.answer, 'days').toDate();
    }
    if (applicationReminders.length == 0 || last.sent < new Date)
    bootbox.dialog({
      message: "Voulez-vous reprogrammer une relance ou archiver l'offre ?",
      buttons: {
        reminder: {
          label: "Reprogrammer une relance",
          className: "btn-primary",
          callback: function () {
            scheduleReminderModal('scheduleApplicationReminderMail', [5, 10, 15], function () {});
          }
        },
        archive: {
          label: "Archiver l'offre",
          className: "btn-primary",
          callback: function () {
            bootbox.dialog({
              message: "Êtes-vous sûr de vouloir archiver cette offre ?",
              buttons: {
                yes: {
                  label: "Oui",
                  className: "btn-primary",
                  callback: function () {
                    Meteor.call('applicationAnswer', Router.current().params._id, 'no', new Date, function (error) {
                      if (error) {
                        Notifications.error('Erreur', error.message);
                      } else {
                        Notifications.success('Succès', 'Une nouvelle étape est validée.');
                        Meteor.call('archiveOffer', Router.current().params._id, function (error) {
                          if (error) {
                            Notifications.error('Erreur', error.message);
                          } else {
                            Notifications.success('Succès', 'Votre offre est maintenant archivée.');
                          }
                        });
                      }
                    });
                  }
                },
                cancel: {
                  label: "Annuler",
                  className: "btn-primary"
                }
              }
            });
          }
        },
        cancel: {
          label: "Annuler",
          className: "btn-primary"
        }
      }
    });
    else
    bootbox.dialog({
      message: "Un mail de rappel de relance est déjà programmé, voulez-vous archiver l'offre ?",
      buttons: {
        yes: {
          label: "Oui",
          className: "btn-primary",
          callback: function () {
            Meteor.call('applicationAnswer', Router.current().params._id, 'no', new Date, function (error) {
              if (error) {
                Notifications.error('Erreur', error.message);
              } else {
                Notifications.success('Succès', 'Une nouvelle étape est validée.');
                Meteor.call('archiveOffer', Router.current().params._id, function (error) {
                  if (error) {
                    Notifications.error('Erreur', error.message);
                  } else {
                    Notifications.success('Succès', 'Votre offre est maintenant archivée.');
                  }
                });
              }
            });
          }
        },
        cancel: {
          label: "Annuler",
          className: "btn-primary"
        }
      }
    });
  },
  'click #application-answer-yes-bad': function (e, t) {
    badAnswerArchiveModal('applicationAnswer');
  },
  'click #application-answer-yes-good': function (e, t) {
    jobInterviewScheduleModal('applicationAnswer', 'yes-good');
  },
  'click #job-interview-answer-no': function (e, t) {
    var steps = Offers.findOne({ _id: Router.current().params._id }).timeline.steps;
    var jobInterviewReminders = _.filter(steps, function (step) {
      return step.type === 'job-interview-reminder';
    });
    if (jobInterviewReminders.length > 0) {
      var last = _.last(_.filter(jobInterviewReminders, function (step) {
        return step.date;
      }));
      last.sent = moment(last.date).add(last.answer, 'days').toDate();
    }
    if (jobInterviewReminders.length == 0 || last.sent < new Date)
    bootbox.dialog({
      message: "Voulez-vous reprogrammer une relance ou archiver l'offre ?",
      buttons: {
        reminder: {
          label: "Reprogrammer une relance",
          className: "btn-primary",
          callback: function () {
            scheduleReminderModal('scheduleJobInterviewReminderMail', [3, 5, 7], function () {});
          }
        },
        archive: {
          label: "Archiver l'offre",
          className: "btn-primary",
          callback: function () {
            bootbox.dialog({
              message: "Êtes-vous sûr de vouloir archiver cette offre ?",
              buttons: {
                yes: {
                  label: "Oui",
                  className: "btn-primary",
                  callback: function () {
                    Meteor.call('jobInterviewAnswer', Router.current().params._id, 'no', new Date, function (error) {
                      if (error) {
                        Notifications.error('Erreur', error.message);
                      } else {
                        Notifications.success('Succès', 'Une nouvelle étape est validée.');
                        Meteor.call('archiveOffer', Router.current().params._id, function (error) {
                          if (error) {
                            Notifications.error('Erreur', error.message);
                          } else {
                            Notifications.success('Succès', 'Votre offre est maintenant archivée.');
                          }
                        });
                      }
                    });
                  }
                },
                cancel: {
                  label: "Annuler",
                  className: "btn-primary"
                }
              }
            });
          }
        },
        cancel: {
          label: "Annuler",
          className: "btn-primary"
        }
      }
    });
    else
    bootbox.dialog({
      message: "Un mail de rappel de relance est déjà programmé, voulez-vous archiver l'offre ?",
      buttons: {
        yes: {
          label: "Oui",
          className: "btn-primary",
          callback: function () {
            Meteor.call('jobInterviewAnswer', Router.current().params._id, 'no', new Date, function (error) {
              if (error) {
                Notifications.error('Erreur', error.message);
              } else {
                Notifications.success('Succès', 'Une nouvelle étape est validée.');
                Meteor.call('archiveOffer', Router.current().params._id, function (error) {
                  if (error) {
                    Notifications.error('Erreur', error.message);
                  } else {
                    Notifications.success('Succès', 'Votre offre est maintenant archivée.');
                  }
                });
              }
            });
          }
        },
        cancel: {
          label: "Annuler",
          className: "btn-primary"
        }
      }
    });
  },
  'click #job-interview-answer-yes-bad': function (e, t) {
    badAnswerArchiveModal('jobInterviewAnswer');
  },
  'click #job-interview-answer-yes-good': function (e, t) {
    bootbox.dialog({
      title: "Félicitations pour cette réponse positive. N'hésitez pas à partager cette bonne nouvelle.",
      message: "<div class=\"text-center\" id=\"success-social-sharing\"></div>",
      buttons: {
        archive: {
          label: "Archiver",
          className: "btn-primary",
          callback: function () {
            Meteor.call('jobInterviewAnswer', Router.current().params._id, 'yes-good', new Date, function (error) {
              if (error) {
                Notifications.error('Erreur', error.message);
              } else {
                Notifications.success('Succès', 'Une nouvelle étape est validée.');
                Meteor.call('archiveOffer', Router.current().params._id, function (error) {
                  if (error) {
                    Notifications.error('Erreur', error.message);
                  } else {
                    Notifications.success('Succès', 'Votre offre est maintenant archivée.');
                  }
                });
              }
            });
          }
        },
        cancel: {
          label: "Annuler",
          className: "btn-primary"
        }
      }
    });
    var options = {
      'title': 'J\'ai réussi à décrocher un poste :D #jobtagpowered',
      'url': 'http://www.jobtag.fr',
      'sitenap': 'JobTag',
      'description': 'J\'ai réussi à décrocher un poste :D #jobtagpowered',
      'excerpt': 'J\'ai réussi à décrocher un poste :D #jobtagpowered',
      'summary': 'J\'ai réussi à décrocher un poste :D #jobtagpowered'
    };
    Blaze.renderWithData(Template.successSocialSharing, options, $("#success-social-sharing")[0]);
  },
  'click #job-interview-answer-yes-interview': function (e, t) {
    jobInterviewScheduleModal('jobInterviewAnswer', 'yes-interview');
  },
});
