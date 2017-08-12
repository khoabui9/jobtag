Template.registerHelper('formatDate', function(date) {
  return moment(date).format('DD/MM/YYYY');
});

Template.registerHelper('formatDateTime', function(date) {
  return moment(date).format('llll');
});
