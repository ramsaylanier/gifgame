Template.lobbyGameView.events({
	'click .delete-btn': function(e, template){
		var gameId = template.data._id;
		var creator = template.data.creator;
		Meteor.call('deleteGame', gameId, creator, function(error, id){
			if (error){
				throwError(error.reason, 'error')
			} else {
				Router.go('/')
			}
		})
	},
	'click .game': function(e, template){
		var gameId = template.data._id;
		var currentUser = Meteor.userId();

		if (Meteor.user().game){
			e.preventDefault();
		}

		Meteor.call('addUserToGame', gameId, currentUser, function(error, id){
			if (error){
				throwError(error.reason, 'error')
			} else {
				Router.go('/games/'+ gameId);
			}
		})
	}
})

Template.lobbyGameView.helpers({
	creator: function(){
		if (Meteor.userId() == this.creator)
			return true
	},
	gameStatus: function(){
		if (this.started == true)
			return "started"
		else 
			return "waiting"
	},
	inGame: function(){
		if (Meteor.user().game == this._id)
			return "in-game"
	}
})