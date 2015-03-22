exports.render = function(req, res){
    res.render("index", {
        title: "Hello WORLD!"
    });
//    res.send("Hello World!");
};
