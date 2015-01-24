Accounts.onCreateUser(function(options, user) {
	if (options.profile)
	    user.profile = options.profile;
	else 
		 user.profile = {name: user.username};

	user.games = [];
		
  return user;
});