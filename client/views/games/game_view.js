Template.gameView.rendered = function(){
	$('.application').removeClass('fade-out');

	var self = this;
}

Template.gameView.helpers({
	'playerName': function(data){
		Meteor.subscribe('playersInGame', data._id);
		return Meteor.users.findOne({_id: this.id}).username;
	},
	'hasSelected':function(data){
		var game = Games.findOne(data._id);

		if (game.rounds){
			var players = game.rounds[game.rounds.length - 1].players;
			var self = this;

			var match = _.find(players, function(player){
				return player.player == self.id;
			})

			if(match)
				return true
		}
	},
	'playersLeft': function(){
		var playerCount = this.players.length;
		var playersLeft = 4 - playerCount;

		if (playersLeft <= 0)
			return "0 more players";
		else if (playersLeft == 1)
			return "1 more player";
		else 
			return playersLeft + " more players";
	},	
	'startable': function(){
		var playerCount = this.players.length;
		var playersLeft = 4 - playerCount;

		if (playersLeft <= 0 && !this.ended)
			return true
	},
	'creator': function(){
		if (Meteor.userId() == this.creator)
			return true
	},
	'winner': function(game){
		if (game.rounds){
			var winners = game.rounds[game.rounds.length - 1].winners;
			var playerId = this.id;

			var match = _.find(winners, function(winner){
				return playerId == winner.player;
			}); 

			if (match){
				return match.place;
			}
		}
	},	
	'gifInHand': function(){
		return Hands.findOne().gifs;
	},
	'isCurrentPlayer': function(){
		if (this.id == Meteor.userId()){
			return 'current-user';
		}
	},
	'gamePrompt': function(){
		if (this.rounds){
			var currentRound = this.rounds.length - 1;
			return this.prompts[currentRound].Card;
		}
	},
	'cardCzar': function(){
		if (this.czar)
			return true

		else {
			var currentCzar = _.find(this.players, function(player){
				return player.czar == true;
			});

			if (currentCzar && currentCzar.id == Meteor.userId())
				return true
		}
	},
	'roundOver': function(){
		if (this.rounds){
			var currentRound = this.rounds.length - 1;

			if (this.rounds[currentRound].ended)
				return true
		}
	},
	'judgmentFinished': function(){
		var currentRound = this.rounds[this.rounds.length - 1];
		var numOfWinners = currentRound.winners.length;
		var numOfPlayers = currentRound.players.length;

		if (numOfWinners == numOfPlayers || numOfWinners >= 3)
			return true
	},
	'currentPlace': function(){
		var currentRound = this.rounds[this.rounds.length - 1];
		var numOfWinners = currentRound.winners.length;

		if (numOfWinners == 0){
			return '1st place';
		} else if (numOfWinners == 1){
			return '2nd place';
		} else if (numOfWinners == 2){
			return '3rd place';
		}
	}
})

Template.gameView.events({
	'click .start-game-btn': function(event, template){
		var gameId = template.data._id;
		var container = $('.game-board');

		Meteor.call('startGame', gameId, function(error){
			if (error)
				throwError(error.reason, 'error');
			else {
				var $container = $('.player-hand');
			}
		});
	},
	'click .delete-game-btn': function(event, template){
		var gameId = template.data._id;

		Meteor.call('deleteGame', gameId, function(error, id){
			if (error)
				throwError(error.reason, 'error')
			else
				Router.go('/');
		})
	},
	'click .end-game-btn': function(event, template){
		var gameId = template.data._id;

		Meteor.call('endGame', gameId, function(error){
			if (error)
				throwError(error.reason, 'error')
		})
	},
	'click .leave-game-btn': function(){

		Meteor.call('removeUserFromGame', this._id, Meteor.userId(), function(error, id){
			if (error)
				throwError(error.reason, 'error')
			else 
				Router.go('/');
		})

	},
	'click .player-card': function(event, template){
		var selection = this,
			game = template.data,
			currentRound = game.rounds.length - 1
			players = game.rounds[currentRound].players;

		// get list of users that have selected white cards already
		var selected = _.pluck(players, 'player');

		if (game.rounds[currentRound].ended){
			return
		} else {

			//check to see if current user is among those with selections
			if (_.contains(selected, Meteor.userId())){

				//update current users selection
				_.map(players, function(player){
					if (player.player == Meteor.userId())
						player.selection = selection;
				})
			} else {

				//add current users selection
				players.push({
					player: Meteor.userId(),
					selection: selection
				})
			}

			Meteor.call('playerSelection', game._id, players, function(error, id){
				if (error)
					throwError(error.reason, 'error');
			});

			$('.player-card').removeClass('selected');
			$(event.currentTarget).addClass('selected');
		}
	}
})


Template.playerCard.rendered = function(){
	var $container = $('.player-hand');
	$container.imagesLoaded( function(){
		$container.isotope({
			itemSelector: '.player-card'
		});
	});
}

Template.playerCard.helpers({
	'gifSource': function(){
		return this.gif.images.fixed_width.url;
	}
})


Template.playerSubmissions.helpers({
	submissions: function(){
		var currentRound = this.rounds.length - 1;
		return(this.rounds[currentRound].players);
	},
	card: function(){
		return this.selection.gif.images.fixed_height.url;
	},
	winningGif: function(game){
		
		var currentRound = game.rounds.length - 1;
		var winners = game.rounds[currentRound].winners;
		var submission = this;

		//find winner
		var match = _.find(winners, function(winner){
			if (winner.player == submission.player){
				return winner.place
			}
		});

		if (match){
			return match.place;
		}
	}
})

Template.playerSubmissions.events({
	'click .submitted-card': function(e, template){
		var game = template.data;

		if (game.rounds[game.rounds.length - 1].winners.length >= 3)
			return false;

		var selection = $(e.currentTarget);
		var czar = _.find(game.players, function(player){
			return player.czar == true
		}).id;	

		var player = this.player;
		var cardScore = this.selection.score;

		if (Meteor.userId() == czar){
			var completed = false;

			Meteor.call('pickWinner', game, player, cardScore, function(error, id){
				if (error)
					throwError(error.reason, 'error');
			});
		}
	}
})