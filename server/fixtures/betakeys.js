Meteor.startup(function () {
  if (BetaKeys.find().count() === 0) {
    var keys = [
      'mddWqhVj8uNiEwCttWaadoBnHX3yR8bNwBDovjOmqkrXj2J1fzIQDociSTZH4nJr',
      'OnlFmRodYvvnq5DH0I8KTsfEEdub81UyqoFVnYlD0apl9Sy6U2Xs7nDVpMpNyQ5r',
      's5LE5gT96X2oQvQZ1H0Fh2jaQ6W0AtIiLbF2A8bAXAtayb2NLloK3g62cBYB12xH',
      '655054d8uS8o9b0g0kDV7RCzH4u528Hc4fkZMCT9UvHDy13UPuN66436p5F1Zm5C',
      'l0DkjrlqaesQ8DMuCBF4EZ0c7XP7bs9mU0AWaaPicOxczJZD4IZ14XbO8m9L6I3Z',
    ];

    keys.forEach(function (element, index, array) {
      BetaKeys.insert({
        token: element,
        used: false
      });
    });
  }
});
