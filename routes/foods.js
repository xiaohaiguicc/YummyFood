var express      = require("express"),
    router       = express.Router(),
    Food         = require("../models/food"),
    middleware   = require("../middleware"),
    NodeGeocoder = require('node-geocoder'),
    multer       = require('multer');
    cloudinary   = require('cloudinary');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY, // hide from others and github
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// =========== Image Upload Configuration =============
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'yummy-food', 
  api_key: 145285794263744, 
  api_secret: process.env.APISECRET
});


//INDEX - show all foods
router.get("/", function(req, res){
    // Get all foods from DB
    Food.find({}, function(err, allFoods){
       if(err){
           console.log(err);
       } else {
            res.render("foods/index",{foods:allFoods});
       }
    });
});

//CREATE - add new food to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
    // cloudinary
    cloudinary.uploader.upload(req.file.path, function(result) {
        // get data from form and create food object
        var name = req.body.name;
        var price = req.body.price;
        var desc = req.body.description;
        var author = {
            id: req.user._id,
            username: req.user.username
        };
        // add cloudinary url for the image to the food object under image property
        var image = {
        // add cloudinary public_id for the image to the food object under image property
            id: result.public_id,
        // add cloudinary url for the image to the food object under image property
            url: result.secure_url
        };
  
          // geocoder for Google Maps
        geocoder.geocode(req.body.location, function (err, data) {
            if (err || !data.length) {
              req.flash('error', 'Invalid address');
              return res.redirect('back');
            }
            var lat = data[0].latitude;
            var lng = data[0].longitude;
            var location = data[0].formattedAddress;
            var newFood = {name: name, price:price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
            // Create a new food and save to DB
            Food.create(newFood, function(err, newlyCreated){
                if(err){
                    console.log(err);
                } else {
                    //redirect back to foods page
                    console.log(newlyCreated);
                    res.redirect("/foods");
                }
            });
        });
    });
});
// router.post("/", middleware.isLoggedIn, function(req, res){
//     // get data from form and add to foods array
//     var name = req.body.name;
//     var image = req.body.image;
//     var price = req.body.price;
//     var desc = req.body.description;
//     var author = {
//         id: req.user._id,
//         username: req.user.username
//     }
//     var newFood = {name: name, price:price, image: image, description: desc, author:author}
//     // Create a new food and save to DB
//     Food.create(newFood, function(err, newlyCreated){
//         if(err){
//             console.log(err);
//         } else {
//             //redirect back to foods page
//             console.log(newlyCreated);
//             res.redirect("/foods");
//         }
//     });
// });

//NEW - show form to create new food
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("foods/new"); 
});

// SHOW - shows more info about one food
router.get("/:id", function(req, res){
    //find the food with provided ID
    Food.findById(req.params.id).populate("comments").exec(function(err, foundFood){
        if(err){
            console.log(err);
        } else {
            console.log(foundFood)
            //render show template with that food
            res.render("foods/show", {foods: foundFood});
        }
    });
});

// EDIT - shows edit form for a food
// store original image id and url
let imageId, imageUrl;
router.get("/:id/edit", middleware.checkFoodOwnership, function(req, res){
    //find the food with provided ID
    Food.findById(req.params.id, function(err, foundFood){
        imageId = foundFood.image.id;
        imageUrl = foundFood.image.url;
        if(err){
            console.log(err);
        } else {
            //render show template with that food
            res.render("foods/edit", {foods: foundFood});
        }
    });
});

// PUT - updates food in the database
router.put("/:id", middleware.checkFoodOwnership, upload.single('image'), function(req, res){
    Food.findByIdAndUpdate(req.params.id, req.body.food, function(err, food){
        if(err){
                req.flash("error", err.message);
                res.redirect("back");
        }else {
            if (req.file) {
                // remove original/old food image on cloudinary
                cloudinary.v2.uploader.destroy(imageId);
                cloudinary.v2.uploader.upload(req.file.path, function(result) {
                    // add cloudinary url for the image to the food object under image property
                    var image = {
                    // add cloudinary public_id for the image to the food object under image property
                        id: result.public_id,
                    // add cloudinary url for the image to the food object under image property
                        url: result.secure_url
                    };
                    // req.flash("error", err.message);
                    // return res.redirect("back");
                    
                    // get data from form and create food object
                    var name = req.body.name;
                    var price = req.body.price;
                    var desc = req.body.description;
                    var author = {
                        id: req.user._id,
                        username: req.user.username
                    };
              
                    geocoder.geocode(req.body.location, function (err, data) {
                        if (err || !data.length) {
                            req.flash('error', 'Invalid address');
                            return res.redirect('back');
                        }
                        req.body.food.lat = data[0].latitude;
                        req.body.food.lng = data[0].longitude;
                        req.body.food.location = data[0].formattedAddress;
                                
                        food.save();
                        req.flash("success","Successfully Updated!");
                        res.redirect("/foods/" + food._id);
                    });
                });
            }
        }
    });
});
// router.put("/:id", function(req, res){
//     var newData = {name: req.body.name, image: req.body.image, description: req.body.desc};
//     Food.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, food){
//         if(err){
//             req.flash("error", err.message);
//             res.redirect("back");
//         } else {
//             req.flash("success","Successfully Updated!");
//             res.redirect("/foods/" + food._id);
//         }
//     });
// });


// DESTROY FOOD ROUTE
router.delete("/:id",middleware.checkFoodOwnership, function(req, res){
   Food.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/foods");
      } else {
          res.redirect("/foods");
      }
   });
});


module.exports = router;

