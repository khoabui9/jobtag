Template.home.helpers({
  news: function () {
    return News.find({}, { sort: { createdAt: -1 }, limit: 10 });
  }
});
