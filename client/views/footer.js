Template.footer.events({
	'click .footer-link': function(e){

		e.preventDefault();
		var currentPath = window.location.pathname;
		var url = $(e.currentTarget).attr('href');

		if (url != currentPath){
			$('.application').addClass('fade-out');

			Meteor.setTimeout(function(){
				Router.go(url);
			}, 300);
		}
	}
})