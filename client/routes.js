Meteor.startup(function () {
  // Main routing
  Router.configure({
    layoutTemplate: 'defaultLayout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
  });

  var subscribeData = function () {
    this.subscribe('userData').wait();
    this.next();
  }

  var requireLogin = function () {
    if (!Meteor.userId()) {
      Router.go('auth');
    } else {
      this.next();
    }
  }

  var alreadyLoggedIn = function () {
    if (Meteor.userId()) {
      Router.go('home');
    } else {
      this.next();
    }
  }

  var checkBeta = function () {
    if (this.ready())
    if (Meteor.user().betaKeyId || Roles.userIsInRole(Meteor.userId(), ['admin'])) {
      this.next();
    } else {
      Router.go('auth.beta');
    }
  }

  var alreadyBeta = function () {
    if (this.ready())
    if (Meteor.user().betaKeyId || Roles.userIsInRole(Meteor.userId(), ['admin'])) {
      Router.go('home');
    } else {
      this.next();
    }
  }

  var checkOffer = function () {
    var offer = Offers.findOne({ _id: this.params._id });
    if (offer)
    this.next();
    else {
      this.layout('defaultLayout');
      this.render('notFound');
    }
  }

  var checkAdmin = function () {
    if (this.ready()) {
      if (Roles.userIsInRole(Meteor.userId(), ['admin']))
      this.next();
      else
      Router.go('home');
    }
  }

  // - Subscribe userData
  Router.onBeforeAction(subscribeData, {except: ['auth']});

  // - Before routing login check
  Router.onBeforeAction(requireLogin, {except: ['auth', 'auth.verify', 'auth.reset']});
  Router.onBeforeAction(alreadyLoggedIn, {only: ['home','auth', 'auth.reset']});

  // - Before routing beta check
  Router.onBeforeAction(checkBeta, {except: ['auth', 'auth.verify', 'auth.reset', 'auth.beta']});
  Router.onBeforeAction(alreadyBeta, {only: ['auth.beta']});

  // - Before routing admin check
  Router.onBeforeAction(checkAdmin, {only: ['admin']});

  // - Before routing offer id check
  Router.onBeforeAction(checkOffer, {only: ['offer']});

  // - Global before routing actions
  Router.onBeforeAction(function() {
    // Add body class
    BodyClass.cleanup();
    BodyClass.run();
    // Remove edit mode for offer
    if (!Session.get('directory.selected'))
    Session.set('directory.selected', 'all-offers');
    Session.set('offer.edited', false);
    Session.set('offer.contacts.edited');
    Session.set('profile.edited', false);
    // Google Analytics
    GAnalytics.pageview();

    this.next();
  });

  // - Global on routing stop actions
  Router.onStop(function() {
    BodyClass.cleanup();
  });

  // - Home
  Router.route('/', { name: 'home',template: 'home' ,layoutTemplate: 'appLayout' });
  // - Auth
  Router.route('/auth', { name: 'auth', template: 'auth', layoutTemplate: 'authLayout' });
  Router.route('/auth/verify', { name: 'auth.verify', template: 'authVerify', layoutTemplate: 'authLayout' });
  Router.route('/auth/reset', { name: 'auth.reset', template: 'authReset', layoutTemplate: 'authLayout' });
  Router.route('/auth/beta', { name: 'auth.beta', template: 'authBeta', layoutTemplate: 'authLayout' });

  // - Admin
  Router.route('/admin', { name: 'admin', template: 'admin', layoutTemplate: 'adminLayout' });

  // - Users
  Router.route('/profile', { name: 'profile', template: 'profile', layoutTemplate: 'appLayout' });

  // - Offers
  Router.route('/offers/new', { name: 'offer.new', template: 'newOffer', layoutTemplate: 'appLayout' });
  Router.route('/offers/:_id', { name: 'offer', template: 'offer', layoutTemplate: 'appLayout' });

  // - Static pages
  Router.route('/faq', { name: 'faq', template: 'faq', layoutTemplate: 'appLayout' });
  Router.route('/faq-beta', { name: 'faq.beta', template: 'betaFaq', layoutTemplate: 'appLayout' });

  // - 404: ALWAYS DEFINED AS THE LAST ONE
  Router.route('*', { name: 'notfound', template: 'notFound', layoutTemplate: 'defaultLayout' });
});
