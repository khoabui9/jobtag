Meteor.methods({
  applicationSent: function (offerId, answer) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    var offer = Offers.findOne({ _id: offerId });
    if (offer.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");
    if (offer.timeline.current.type != 'application-sent')
    throw new Meteor.Error("Etape invalide.");

    var validAnswer = _.contains(['no', 'yes'], answer);
    if (!validAnswer)
    throw new Meteor.Error("Réponse invalide.");

    Offers.update({ _id: offerId }, {
      $set: {
        'timeline.current.type': answer === 'yes' ? 'application-answer' : 'finished',
      },
      $push: {
        'timeline.steps': {
          type: 'application-sent',
          date: new Date,
          answer: answer
        }
      }
    });
  },
  scheduleApplicationReminderMail: function (offerId, days) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    var offer = Offers.findOne({ _id: offerId });
    if (offer.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");
    if (offer.timeline.current.type != 'application-sent' && offer.timeline.current.type != 'application-answer')
    throw new Meteor.Error("Etape invalide.");

    var validDays = _.contains([5, 10, 15], days);
    if (!validDays)
    throw new Meteor.Error("Nombre de jours invalide.");

    var steps = offer.timeline.steps;
    var applicationReminders = _.filter(steps, function (step) {
      return step.type === 'application-reminder';
    });
    if (applicationReminders.length > 0) {
      var last = _.last(_.filter(applicationReminders, function (step) {
        return step.date;
      }));
      last.sent = moment(last.date).add(last.answer, 'days').toDate();
      if (last.sent > new Date)
      throw new Meteor.Error("Un mail de rappel est déjà programmé.");
    }

    if (Meteor.isServer) {
      var currentDate = new Date;
      var options = {
        offerId: offerId,
        days: days,
        step: 'application-reminder',
        date: moment(currentDate).add(days, 'days').toDate(),
        to: Meteor.user().emails[0].address,
        subject: 'Rappel de relance de candidature pour l\'offre ' + offer.title,
        text: 'Bonjour,\n\nVoici un petit rappel pour que vous relanciez la société ' + offer.company + ' au sujet de l\'offre ' + offer.title + '.\nBon courage dans votre recherche.\n\n-- \nL\'équipe JobTag',
      };

      Scheduler.applicationReminderMail(options);

      Offers.update({ _id: offerId }, {
        $push: {
          'timeline.steps': {
            type: 'application-reminder',
            date: currentDate,
            answer: days
          }
        }
      });
    }
  },
  applicationAnswer: function (offerId, answer, datetime) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    var offer = Offers.findOne({ _id: offerId });
    if (offer.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");
    if (offer.timeline.current.type != 'application-answer')
    throw new Meteor.Error("Etape invalide.");

    var validAnswer = _.contains(['no', 'yes-bad', 'yes-good'], answer);
    if (!validAnswer)
    throw new Meteor.Error("Réponse invalide.");

    if (answer === 'yes-good') {
      if (Meteor.isServer) {
        var currentDate = new Date;
        var options = {
          offerId: offerId,
          datetime: datetime,
          step: 'job-interview-h24',
          date: moment(datetime, 'llll').subtract(1, 'days').toDate(),
          to: Meteor.user().emails[0].address,
          subject: 'Rappel de l\'entretien dans 24h pour l\'offre ' + offer.title,
          text: 'Bonjour,\n\nVoici un petit rappel concernant votre entretien de demain avec la société ' + offer.company + ' au sujet de l\'offre ' + offer.title + '.\nVous avez rendez-vous le ' + datetime + '.\nBonne chance pour demain.\n\n-- \nL\'équipe JobTag',
        };

        Scheduler.interviewH24Mail(options);

        Offers.update({ _id: offerId }, {
          $set: {
            'timeline.current.type': 'job-interview-answer',
          },
          $push: {
            'timeline.steps': {
              $each: [
                {
                  type: 'job-interview',
                  date: moment(datetime, 'llll').toDate()
                },
                {
                  type: 'application-answer',
                  date: new Date,
                  answer: answer
                }
              ]
            }
          }
        });
      }
    } else {
      Offers.update({ _id: offerId }, {
        $set: {
          'timeline.current.type': 'finished',
        },
        $push: {
          'timeline.steps': {
            type: 'application-answer',
            date: new Date,
            answer: answer
          }
        }
      });
    }

    // Remove old useless reminder steps
    var reminders = _.filter(offer.timeline.steps, function (step) {
      return step.type === 'application-reminder';
    });
    _.each(reminders, function (reminder) {
      if (moment(reminder.date).add(reminder.answer, 'days').toDate() > new Date) {
        Offers.update({ _id: offerId }, {
          $pull: {
            'timeline.steps': {
              type: 'application-reminder',
              date: reminder.date,
              answer: reminder.answer
            }
          }
        });
      }
    });
  },
  scheduleJobInterviewReminderMail: function (offerId, days) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    var offer = Offers.findOne({ _id: offerId });
    if (offer.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");
    if (offer.timeline.current.type != 'job-interview-answer')
    throw new Meteor.Error("Etape invalide.");

    var validDays = _.contains([3, 5, 7], days);
    if (!validDays)
    throw new Meteor.Error("Nombre de jours invalide.");

    var steps = offer.timeline.steps;
    var jobInterviewReminders = _.filter(steps, function (step) {
      return step.type === 'job-interview-reminder';
    });
    if (jobInterviewReminders.length > 0) {
      var last = _.last(_.filter(jobInterviewReminders, function (step) {
        return step.date;
      }));
      last.sent = moment(last.date).add(last.answer, 'days').toDate();
      if (last.sent > new Date)
      throw new Meteor.Error("Un mail de rappel est déjà programmé.");
    }

    if (Meteor.isServer) {
      var currentDate = new Date;
      var options = {
        offerId: offerId,
        days: days,
        step: 'job-interview-reminder',
        date: moment(currentDate).add(days, 'days').toDate(),
        to: Meteor.user().emails[0].address,
        subject: 'Rappel de relance de réponse suite à votre entretien pour l\'offre ' + offer.title,
        text: 'Bonjour,\n\nVoici un petit rappel pour que vous relanciez la société ' + offer.company + ' au sujet de l\'offre ' + offer.title + '.\nBon courage dans votre recherche.\n\n-- \nL\'équipe JobTag',
      };

      Scheduler.interviewReminderMail(options);

      Offers.update({ _id: offerId }, {
        $push: {
          'timeline.steps': {
            type: 'job-interview-reminder',
            date: currentDate,
            answer: days
          }
        }
      });
    }
  },
  jobInterviewAnswer: function (offerId, answer, datetime) {
    if (!Meteor.userId())
    throw new Meteor.Error("Vous n'êtes pas connecté.");

    var offer = Offers.findOne({ _id: offerId });
    if (offer.userId != Meteor.userId())
    throw new Meteor.Error("Vous ne pouvez pas faire ça.");
    if (offer.timeline.current.type != 'job-interview-answer')
    throw new Meteor.Error("Etape invalide.");

    var validAnswer = _.contains(['no', 'yes-bad', 'yes-good', 'yes-interview'], answer);
    if (!validAnswer)
    throw new Meteor.Error("Réponse invalide.");

    if (answer === 'yes-good') {
      Offers.update({ _id: offerId }, {
        $set: {
          'timeline.current.type': 'finished',
        },
        $push: {
          'timeline.steps': {
            type: 'job-interview-answer',
            date: new Date,
            answer: answer
          }
        }
      });
    } else if (answer === 'yes-interview') {
      if (Meteor.isServer) {
        var currentDate = new Date;
        var options = {
          offerId: offerId,
          datetime: datetime,
          step: 'job-interview-h24',
          date: moment(datetime, 'llll').subtract(1, 'days').toDate(),
          to: Meteor.user().emails[0].address,
          subject: 'Rappel de l\'entretien dans 24h pour l\'offre ' + offer.title,
          text: 'Bonjour,\n\nVoici un petit rappel concernant votre entretien de demain avec la société ' + offer.company + ' au sujet de l\'offre ' + offer.title + '.\nVous avez rendez-vous le ' + datetime + '.\nBonne chance pour demain.\n\n-- \nL\'équipe JobTag',
        };

        Scheduler.interviewH24Mail(options);

        Offers.update({ _id: offerId }, {
          $set: {
            'timeline.current.type': 'job-interview-answer',
          },
          $push: {
            'timeline.steps': {
              $each: [
                {
                  type: 'job-interview',
                  date: moment(datetime, 'llll').toDate()
                },
                {
                  type: 'job-interview-answer',
                  date: new Date,
                  answer: answer
                }
              ]
            }
          }
        });
      }
    } else {
      Offers.update({ _id: offerId }, {
        $set: {
          'timeline.current.type': 'finished',
        },
        $push: {
          'timeline.steps': {
            type: 'job-interview-answer',
            date: new Date,
            answer: answer
          }
        }
      });
    }

    // Remove old useless reminder steps
    var reminders = _.filter(offer.timeline.steps, function (step) {
      return step.type === 'job-interview-reminder';
    });
    _.each(reminders, function (reminder) {
      if (moment(reminder.date).add(reminder.answer, 'days').toDate() > new Date) {
        Offers.update({ _id: offerId }, {
          $pull: {
            'timeline.steps': {
              type: 'job-interview-reminder',
              date: reminder.date,
              answer: reminder.answer
            }
          }
        });
      }
    });
  },
});
