Template.lobby.rendered = function(){
	Meteor.setTimeout(function(){
		$('.application').removeClass('fade-out');
	}, 100);
}


Template.lobby.helpers({
	games: function(){
		return Games.find({ended: false});
	},
	inGame: function(){
		var gameId = Meteor.user().game;
		if (gameId){
			return Games.findOne({_id: gameId}).name;
		}
	},
	gameId: function(){
		return Meteor.user().game;
	}
})

Template.lobby.events({
	'click .leave-game-btn': function(e){
		e.preventDefault();
		var gameId = Meteor.user().game;
		var userId = Meteor.userId();

		Meteor.call('removeUserFromGame', gameId, userId, function(error, id){
			if (error)
				throwError(error.reason, 'error')
			else 
				Router.go('/');
		})

	},
	'click .create-game-btn': function(){
		$('.new-game-form').removeClass('collapsed');
	}
})