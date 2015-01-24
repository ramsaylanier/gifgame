Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading',
	waitOn: function(){
		return Meteor.subscribe('currentUser');
	}
});

Router.onBeforeAction('loading');
Router.onBeforeAction(function checkForUser(){
	clearErrors(); 

	if (!Meteor.userId()){
		this.redirect('/login');
		this.render('login');
		this.render('', {to: 'header'});
	} else {
		this.next();
	}
}, {
	except: ['landingPage', 'about']
});

Router.map(function(){

	this.route('landingPage', {
		path: '/',
		action: function(){
			if (Meteor.userId()){
				this.redirect('/lobby');
			} else {
				this.render();
			}
		}
	});

	this.route('login', {
		path: '/login'
	})

	this.route('about', {
		path: '/about'
	})

	this.route('lobby', {
		path: '/lobby',
		waitOn: function(){
			return Meteor.subscribe('publicGames');
		},
		action: function(){
			this.render('lobby');
			this.render('header', {to: 'header'});
		}
	});

	this.route('gameView', {
		path: '/games/:_id',
		waitOn: function(){
			return [
				Meteor.subscribe('currentGame', this.params._id),
				Meteor.subscribe('playersInGame', this.params._id),
				Meteor.subscribe('playerHands', this.params._id)
			]
		},
		data: function(){
			return Games.findOne(this.params._id)
		},
		action: function(){
			this.render('gameView');
			this.render('header', {to: 'header'});
		}
	});
});