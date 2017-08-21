Template.registerHelper('formatDate', function(date) {
  return moment(date).format('DD/MM/YYYY');
});

Template.registerHelper('formatDateTime', function(date) {
  return moment(date).format('llll');
});

Template.registerHelper('and', function(a, b) {  
  return a && b;
});
