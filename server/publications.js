Meteor.publish('publicGames', function(){
	return Games.find();
})

Meteor.publish('currentUser', function(){
	return Meteor.users.find(this.userId);
})

Meteor.publish('currentGame', function(gameId){
	return Games.find(gameId);
})

Meteor.publish('playersInGame', function(gameId){
	var game = Games.findOne(gameId),
		players = _.pluck(game.players, 'id');

	return Meteor.users.find({_id: {$in: players}}, {fields: {username: 1, "profile.name": 1}});
});

Meteor.publish('playerHands', function(gameId){
	return Hands.find({playerId: this.userId, gameId: gameId});
});