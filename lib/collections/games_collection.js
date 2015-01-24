Games = new Mongo.Collection('games');


Meteor.methods({
	createGame: function(gameAttributes){
		var loggedInUser = this.userId;
		var deck = Gifs.find().fetch();
		var prompts = Prompts.find().fetch();

		//shuffle deck
		deck = _.sample(deck, 100);
		prompts = _.sample(prompts, 30);

		if (!gameAttributes.name){
			throw new Meteor.Error(422, 'Please enter a name for your game');
		}

		var game = _.extend(_.pick(gameAttributes, 'name', 'isPublic', 'creator'), {
			started: false,
			ended: false,
			gifDeck: deck,
			prompts: prompts,
			players: [{id: loggedInUser, czar:true, score: 0}],
			submitted: new Date()
		});

		//create new game
		var gameId = Games.insert(game);

		//add game to creator's collection
		Meteor.users.update({_id: loggedInUser}, {$set: {game: gameId}});

		return gameId;
	},
	deleteGame: function(gameId){
		var game = Games.findOne(gameId);
		var players = game.players;

		_.each(players, function(player){
			Meteor.users.update({ _id: player.id }, {$set: { game: null}} );
		});

		Games.remove(gameId);
	},
	addUserToGame: function(gameId, userId){
		if (Meteor.users.findOne({_id: userId, game:gameId}))
			return;
		else if ( Meteor.users.findOne({_id: userId}).game )
			throw new Meteor.Error(422, 'You are already in a game.');
		else if(gameId && userId){

			var game = Games.findOne(gameId),
				players = game.players;

			if (game.started){
				throw new Meteor.Error(422, 'This game has already started.');
			}

			if (players.length >= 8){
				throw new Meteor.Error(422, "This game is full");
			}

			Games.update({_id: gameId}, {$addToSet: { players: {id: userId, czar: false, score: 0}}});
			return Meteor.users.update({ _id: userId } , {$set: {game: gameId}});
		}
	},
	removeUserFromGame: function(gameId, userId){
		game = Games.findOne(gameId);

		isCzar = _.findWhere(game.players, {id: userId}).czar;

		//if user created game, they cannot leave it
		if (game.createor == userId){
			throw new Meteor.Error(422, "You created the game. You cannot leave it!")
		//if the user is currently the Card Czar, update card czar upon leaving game;
		} else if (gameId && userId){
			if (Games.findOne(gameId).ended)
				return Meteor.users.update({ _id: userId }, {$set: { game: null}} );
			else {
				if (isCzar){
					Meteor.call('updateCzar', gameId, function(){
						Games.update({_id: gameId}, { $pull: { players: { id: userId}}});
					});
				} else {
					Games.update({_id: gameId}, { $pull: { players: { id: userId}}});
				}

				return Meteor.users.update({ _id: userId }, {$set: { game: null}} );
			}
		}
	},
	updateCzar: function(gameId){
		var game = Games.findOne(gameId);
		_.find(game.players, function(player, index){
			if (player.czar == true){
				game.players[index].czar = false;

				if (!game.players[index + 1]){
					game.players[0].czar=true;
				} else {
					game.players[index + 1].czar=true;
				}

				return player.czar == false;
			} else 
				return player.czar == true;
		})

		Games.update({_id: gameId}, {$set: {players: game.players}});
	},
	startGame: function(gameId){
		var game = Games.findOne(gameId);
		var gifDeck = game.gifDeck;
		var players = game.players;

		_.each(players, function(player){
			var gifs = [];

			for (var i=0; i < 10; i++){
				var gif = {
					gif: gifDeck.pop(),
					score: 1
				}
				gifs.push(gif);
			}

			var hand = {
				playerId: player.id,
				gameId: gameId,
				gifs: gifs
			}

			Hands.insert(hand);
		})

		Games.update({_id: gameId}, {$set: {gifDeck: gifDeck, started: true}});

		Meteor.call("newRound", game);
	},
	newRound: function(game){
		var newRoundNumber = 1;

		//check to see if this is the first round
		if (game.rounds)
			newRoundNumber = game.rounds.length + 1;

		//pull the next black card from the front of the gameDeck
		var prompt = game.prompts[newRoundNumber - 1].Card;

		//push new empty round to Games collection
		Games.update({_id: game._id},{
			$push: {rounds: {prompt: prompt, ended: false, winners: [], round: newRoundNumber, players: []}}
		});

		Meteor.call('startRound', game._id, newRoundNumber);
	},
	startRound: function(gameId, round){
		var clock = 30;
		var interval = Meteor.setInterval(function () {
			var game = Games.findOne(gameId);

			if (!game.rounds[round - 1].ended){
				clock -= 1;
				Games.update(gameId, {$set: {clock: clock}});

				// end of game
				if (clock === 0) {
					// stop the clock
					Meteor.clearInterval(interval);
					Games.update({_id: gameId, "rounds.round": round}, {$set: { "rounds.$.ended": true}});

					if (game.rounds[round - 1].players.length == 0){
						Meteor.call('pickWinner', game)
					}
				}
			}
		}, 1000);
	},
	playerSelection: function(gameId, players){
		var currentRound = Games.findOne(gameId).rounds.length;
		Games.update({_id: gameId, "rounds.round": currentRound}, {$set: {"rounds.$.players": players}});

		//check to see if all players have made selections
		if (Games.findOne(gameId).players.length - 1 == players.length){
			//end round if all players have selected
			Games.update({_id: gameId, "rounds.round": currentRound}, {$set: { clock: 0, "rounds.$.ended": true}});
		}
	},
	pickWinner: function(game, player, cardScore){
		var round = game.rounds[game.rounds.length - 1];
		var roundNumber = game.rounds.length;
		var score = 0;
		var winners = round.winners;
		var numOfWinners = winners.length;
		var numOfPlayers = round.players.length;


		if (numOfPlayers == 0){
			triggerNextRound();
		} 

		else{ 
			if (_.some(winners, function(winner){
				return winner.player == player
			})){
				throw new Meteor.Error(422, 'You have already placed this Gif.');
			}

			if (winners[1]){
				//set bronze
				Games.update({_id: game._id, "rounds.round": roundNumber }, {$push: { "rounds.$.winners": { place: "bronze", player: player } } } );
				score = cardScore;

				triggerNextRound();

			} else if (winners[0]){
				//set silver
				Games.update({_id: game._id, "rounds.round": roundNumber }, {$push: { "rounds.$.winners": { place: "silver", player: player } } });
				score = 2 * cardScore;

				numOfWinners++;
				checkIfEnoughSubmissions();
			} else {
				Games.update({_id: game._id, "rounds.round": roundNumber }, {$push: { "rounds.$.winners": { place: "gold", player: player } } });
				score = 3 * cardScore;

				numOfWinners++;
				checkIfEnoughSubmissions();
			}
		}

		Games.update({_id: game._id, "players.id": player}, {$inc: {"players.$.score": score }});

		function checkIfEnoughSubmissions(){
			if (numOfWinners == round.players.length)
				triggerNextRound();
		}

		function triggerNextRound(){
			Meteor.call('discard', game._id);

			var clock = 5;
			var interval = Meteor.setInterval(function () {

			clock -= 1;
			Games.update(game._id, {$set: {clock: clock}});

				if (clock === 0) {
					// stop the clock
					Meteor.clearInterval(interval);
					
					Meteor.call('updateCzar', game._id);
					Meteor.call('newRound', game);
				}
			}, 1000);
		}
	},
	updateGameDeck: function(gameId, gameDeck){
		Games.update({_id: gameId}, {$set: {gameDeck: gameDeck}});
	},
	discard: function(gameId){
		var game = Games.findOne({_id: gameId});
		//loop through each player
		_.each(game.players, function(player){
			var playerId = player.id;

			//find the players card selection
			var selection = _.find(game.rounds[game.rounds.length - 1].players, function(element){
				return element.player == playerId;
			});

			//if it exists
			if (selection){
				var removedGif = selection.selection.gif._id;
				var hand = Hands.findOne({playerId: playerId, gameId: gameId});
		
				//remove selected Gif
				hand.gifs = _.reject(hand.gifs, function(element){
					if (element.gif)
						return element.gif._id == removedGif;
				})

				//add new Gif to hand
				if (hand.gifs.length < 10){
					hand.gifs.push({
						gif: game.gifDeck.pop(),
						score: 1
					});		
				}

				//update Hand to reflect removed gif and added gif
				Hands.update({playerId: playerId, gameId: gameId}, {$set: { gifs: hand.gifs } } );
			}
		});

		Games.update({_id: gameId}, {$set: {gifDeck: game.gifDeck} });
	},
	updateCzar: function(gameId){
		var game = Games.findOne(gameId);
		_.find(game.players, function(player, index){
			if (player.czar == true){
				game.players[index].czar = false;

				if (!game.players[index + 1]){
					game.players[0].czar=true;
				} else {
					game.players[index + 1].czar=true;
				}

				return player.czar == false;
			} else 
				return player.czar == true;
		})
		Games.update({_id: gameId}, {$set: {players: game.players}});
	},
	endGame: function(gameId){
		var game = Games.findOne(gameId);
		var players = game.players;

		_.each(players, function(player){
			Meteor.users.update({_id: player.id}, {$set: {game: null}});
		})

		Games.update({_id: gameId}, {$set: {started: false, ended: true}})
	}
});


