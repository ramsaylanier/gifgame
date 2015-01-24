Template.landingPage.rendered = function(){
	$('.application').removeClass('fade-out');
	$('.container').removeClass('decision-made decision-loaded about-loaded');
}


Template.landingPage.events({
	'click .yes-btn': function(){
		$('.container').addClass('decision-made');

		Meteor.setTimeout(function(){
			$('.container').addClass('decision-loaded');

			Router.go('/login');
			// Blaze.render(Template.login, $('.landing-page').get(0) )
		}, 600);
	},
	'click .no-btn': function(){
		$('.container').addClass('decision-made');

		Meteor.setTimeout(function(){
			$('.hero').css({
	        	"background-image": "url('no-gif.gif')"
	        });
			$('.container').addClass('decision-loaded');
		}, 600);
	},
	'click .about-link': function(){
		$('.container').addClass('decision-made');

		Meteor.setTimeout(function(){
			$('.container').addClass('about-loaded');

			Router.go('/about');
			// Blaze.render(Template.login, $('.landing-page').get(0) )
		}, 600);
	}
})