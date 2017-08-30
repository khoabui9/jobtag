Template.dashboard.helpers({
	totalOffers: function() {
		var numOff = Offers.find({status: "opened"}).count();

		return numOff;
	}
});

