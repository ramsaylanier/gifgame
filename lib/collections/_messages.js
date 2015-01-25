Chats = new Mongo.Collection('chats');

Meteor.methods({
	'createMessage': function(gameId, message){
		if (!gameId)
			throw new Meteor.Error(422, 'No game is associated with this chat message.');

		if (!message.username)
			throw new Meteor.Error(422, 'No username is associated with this chat message.');

		if (!message.text)
			throw new Meteor.Error(422, 'This chat message has no text');

		var message = _.extend(_.pick(message, 'username', 'text'), {
			submitted: new Date(),
			gameId: gameId
		})

		var chatId = Chats.insert(message);

		return chatId;
	}
})