getRandomGif = function(){
	HTTP.get("http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&limit=30", function(error, result){
		if (error)
			throw new Meteor.Error(422, error.reason)
		else{
			return result.data;
		}
	})
}