Messages = new Meteor.Collection('messages');

Template.chatroom.helpers({
	'chats':function(){
		return Chats.find();
	}
})

Template.chatroom.events({
	'click .chat-btn': function(){
		$('.chatroom').toggleClass('off-page');
	},
	'submit .chat-message-form': function(e, template){
		e.preventDefault();

		var gameId = template.data._id;

		var message = {
			username: Meteor.user().username,
			text: $(e.target).find('[name=chat-message-field]').val()
		}

		Meteor.call('createMessage', gameId, message, function(error){
			if (error)
				throwError(error.result, error)
		})
	}

})

Template.chatMessage.rendered = function(){
	target = $('.chat-feed')[0].scrollHeight;
	
	$('.chat-feed').animate({
		scrollTop: target
	})
}

Template.chatMessage.helpers({
	'userNameMatch': function(){
		if (Meteor.user().username == this.username)
			return true
	}
})