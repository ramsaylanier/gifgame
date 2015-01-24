Template.account.events({
	'click .logout-link': function(e){
		e.preventDefault();
		var app = $('.application');

		app.addClass('fade-out');

		Meteor.logout(function(){
			app.removeClass('with-account');
		});
	}
})