Meteor.startup(function () {
    // var counter = Gifs.find().count() / 100;
    // var cutoff = counter + 30;

    // while (counter < cutoff){
    //     var offset = counter * 100;
    //     counter++;

    //     HTTP.get("http://api.giphy.com/v1/gifs/search?q=reaction&rating=r&limit=100&offset=" + offset + "&api_key=dc6zaTOxFJmzC", function(error, result){
    //         if (error)
    //             throw new Meteor.Error(422, error.reason)
    //         else {
    //             if (result.data.meta.status == 200){
    //                 _.each(result.data.data, function(item, index){
    //                     Gifs.insert({images: item.images, rating: item.rating});
    //                 })
    //             } else {
    //                 console.log(result.data.meta.msg);
    //             }
    //         }
    //     });
    // }

    if (Prompts.find().count() === 0){
            var prompts = Meteor.prompts();

            _.each(prompts, function(prompt){
                    return Prompts.insert(prompt);
            });
    }
});