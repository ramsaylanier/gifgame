Template.login.rendered = function(){
	Session.set('registerPage', false);
	$('.application').removeClass('fade-out');
	$('.container').addClass('decision-loaded').removeClass('about-loaded');

	Meteor.defer(function(){
		$('.login-form-wrapper').removeClass('off-page');
		$('.form-control').removeClass('off-page');
	})
}

Template.login.events({
	'submit .login-form': function(e){
		e.preventDefault();

		var userName = $(e.target).find('[name="username"]').val();
		var password = $(e.target).find('[name="password"]').val();

		Meteor.loginWithPassword(userName, password, function(error){
			if (error)
				throwError(error.reason, 'error')
			else{
				// $('.application').addClass('fade-out');
				Session.set('registerPage', false);
				$('.container').removeClass('decision-made decision-loaded');
				Router.go('/lobby');
			}
		})
	},
	'submit .register-form': function(e){
		e.preventDefault();

		var user = {
			username: $(e.target).find('[name="username"]').val(),
			email: $(e.target).find('[name="email"]').val(),
			password: $(e.target).find('[name="password"]').val(),
		}

		var passwordConfirm = $(e.target).find('[name="password-confirm"]').val();

		if (!user.username)
			throwError("Please enter a username.", 'error');

		else if (!user.email)
			throwError("Please enter an email address.", 'error');

		else if (!user.password)
			throwError("Please enter a password.", 'error');

		else if (user.password.length < 6)
			throwError("Passwords is less that 6 character.", 'error');

		else if (user.password != passwordConfirm){
			throwError("Passwords do not match.", 'error');
		}

		else (
			Accounts.createUser({email: user.email, password: user.password, username: user.username }, function(error){
				if (error)
					throwError(error.reason, 'error');
				else {
					Session.set('registerPage', false);
					$('.container').removeClass('decision-made decision-loaded');
					Router.go('/lobby');
				}
			})
		)
	},
	'click .register-link': function(e){
		Session.set('registerPage', true);

		Meteor.setTimeout(function(){
			$('.form-control').removeClass('off-page');
		})
	}
})

Template.login.helpers({
	'userFirstName': function(){
		return Meteor.users.findOne().firstName;
	},
	'registerPage': function(){
		var registerPage = Session.get('registerPage');

		if (registerPage){
			$('.form-control').removeClass('off-page');
			return true
		}
	}
})