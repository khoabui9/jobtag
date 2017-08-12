FutureTasks = new Meteor.Collection('future_tasks');

var Schemas = {};

Schemas.FutureTask = new SimpleSchema({
  type: {
    type: String,
    label: "Type",
    allowedValues: ['mail']
  },
  options: {
    type: Object,
    label: "Options",
    blackbox: true
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
  }
});

FutureTasks.attachSchema(Schemas.FutureTask);

// STARTUP
Meteor.startup(function() {
  // Check mail tasks
  FutureTasks.find({type: 'mail'}).forEach(function (task) {
    if (task.options.step === 'application-reminder') {
      if (task.options.date < new Date()) {
        sendApplicationReminderMail(task.options);
      } else {
        addApplicationReminderMailTask(task._id, task.options);
      }
    } else if (task.options.step === 'job-interview-h24') {
      if (task.options.date < new Date()) {
        sendInterviewH24Mail(task.options);
      } else {
        addInterviewH24MailTask(task._id, task.options);
      }
    } else if (task.options.step === 'job-interview-reminder') {
      if (task.options.date < new Date()) {
        sendInterviewReminderMail(task.options);
      } else {
        addInterviewReminderMailTask(task._id, task.options);
      }
    }
  });
  // Start SyncedCron
  SyncedCron.start();
});

// ACTIONS
function sendTextMail(options) {
  Email.send({
    from: "no-reply@jobtag.fr",
    to: options.to,
    subject: options.subject,
    text: options.text
  });
}

function sendApplicationReminderMail(options) {
  var offer = Offers.findOne({ _id: options.offerId });

  // Send mail only if current timeline step is application answer waiting
  // and the offer is currently opened
  if (offer && offer.timeline.current.type === 'application-answer' && offer.status === 'opened')
  sendTextMail(options);
}

function sendInterviewH24Mail(options) {
  var offer = Offers.findOne({ _id: options.offerId });

  // Send mail only if current timeline step is job interview answer waiting
  // and the offer is currently opened
  if (offer && offer.timeline.current.type === 'job-interview-answer' && offer.status === 'opened')
  sendTextMail(options);
}

function sendInterviewReminderMail(options) {
  var offer = Offers.findOne({ _id: options.offerId });

  // Send mail only if current timeline step is job interview answer waiting
  // and the offer is currently opened
  if (offer && offer.timeline.current.type === 'job-interview-answer' && offer.status === 'opened')
  sendTextMail(options);
}

// TASKS RELATED
function addApplicationReminderMailTask(id, options) {
  SyncedCron.add({
    name: id,
    schedule: function(parser) {
      return parser.recur().on(options.date).fullDate();
    },
    job: function() {
      sendApplicationReminderMail(options);
      FutureTasks.remove(id);
      SyncedCron.remove(id);
      return id;
    }
  });
}

function addInterviewH24MailTask(id, options) {
  SyncedCron.add({
    name: id,
    schedule: function(parser) {
      return parser.recur().on(options.date).fullDate();
    },
    job: function() {
      sendInterviewH24Mail(options);
      FutureTasks.remove(id);
      SyncedCron.remove(id);
      return id;
    }
  });
}

function addInterviewReminderMailTask(id, options) {
  SyncedCron.add({
    name: id,
    schedule: function(parser) {
      return parser.recur().on(options.date).fullDate();
    },
    job: function() {
      sendInterviewReminderMail(options);
      FutureTasks.remove(id);
      SyncedCron.remove(id);
      return id;
    }
  });
}

// SCHEDULING - Functions to call in methods
Scheduler = {};
Scheduler.applicationReminderMail = function (options) {
  if (options.date < new Date()) {
    sendApplicationReminderMail(options);
  } else {
    var ftId = FutureTasks.insert({type: 'mail', options: options});
    addApplicationReminderMailTask(ftId, options);
  }
  return true;
}
Scheduler.interviewH24Mail = function (options) {
  if (options.date < new Date()) {
    sendInterviewH24Mail(options);
  } else {
    var ftId = FutureTasks.insert({type: 'mail', options: options});
    addInterviewH24MailTask(ftId, options);
  }
  return true;
}
Scheduler.interviewReminderMail = function (options) {
  if (options.date < new Date()) {
    sendInterviewReminderMail(options);
  } else {
    var ftId = FutureTasks.insert({type: 'mail', options: options});
    addInterviewReminderMailTask(ftId, options);
  }
  return true;
}
