Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

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
	},
	'click .create-game-link': function(e){
		e.preventDefault();

		if (Meteor.user().game){
			throwError('You cannot great a game if you are already in one!');
		} else {
			var app = $('.application');
			app.toggleClass('with-create-game').removeClass('with-account');
			if (app.hasClass('with-create-game')){
				Blaze.render(Template.newGameForm, $('.footer').get(0));
			} else{
				Meteor.setTimeout(function(){
					$('.new-game-form').remove();
				}, 400);
			}
		}
	},
	'click .account-link': function(e){
		e.preventDefault();

		var app = $('.application');
		app.toggleClass('with-account').removeClass('with-create-game');

		if (app.hasClass('with-account')){
			Blaze.render(Template.account, $('.footer').get(0));
			$(e.currentTarget).html()
		} else{
			Meteor.setTimeout(function(){
				$('.account').remove();
			}, 400);
		}
	}
})

Template.footer.helpers({
	notInGame: function(){
		var gameId = Meteor.user().game;
		if (!gameId){
			return true
		}
	}
})