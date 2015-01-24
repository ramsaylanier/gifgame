Template.newGameForm.events({
	'submit form': function(event){
		event.preventDefault();

		var game = {
			name: $('.game-name-field').val(),
			isPublic: $('.is-public-field').prop('checked'),
			creator: Meteor.userId()
		}

		console.log(game);

		Meteor.call('createGame', game, function(error, id){
			if (error){
				//call custom throwError function
				throwError(error.reason, 'error');
			} else {
				$('.application').removeClass('with-create-game');
				$('.new-game-form').remove();
				Router.go('/games/' + id);
			}
		});
	}
})