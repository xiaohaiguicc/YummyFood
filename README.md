# YummyFood
YummyFood is a full-stack web application that facilitates visitors shares yummy food information. It utilizes node.js on the backend, a MongoDB database, and javascript on the frontend.

## [Live Demo](https://fathomless-lake-91255.herokuapp.com)
Link to the active app https://fathomless-lake-91255.herokuapp.com
## Features

# Google maps API
A location feature to show food's location on google map, using the Google Maps API
* Step:
  *	Get API key: Get Google Maps API Key -> Restrict Google Maps API Key -> Enable Geocoding API -> Get another key for       
    Geocoding API
  *	Add to application as ENV variable -> Add Google Maps scripts to your application -> Display the campground location in       
    show.ejs -> Update food model:  location: String, lat: Number, lng: Number -> Update new and edit forms with locations -> 
    Update campground routes: install geocoder, add geocoder part in POST and PUT request.

# Authentication:
* User register with username, password, first/last name, profile photo, admin code (if have)
*	User register with username and password. Function for new customer sign up first
*	User logout
*	Admin can manage all posts and comments
* Steps:
  ```sh
  *	npm install passport passport-local –save
  *	npm -I passport-local-monoose --save
  *	npm -I  express-session –save
  ```
# Admin User Role Authorization
Admin role. Can edit/delete any posts/comments
* Steps:
  *	Update user model: 
  ```
  isAdmin: {type: Boolean, default: false}
  ```
  *	Update register and login forms with admin input
  *	Update show.ejs that the admin can see the "edit/delete" buttons
  *	Update middleware function that admin and edit or delete posts and comments
  *	Update index router: assign isAdmin value by POST request. Use environment value ADMINCODE to hide the secret code

# Create User Profiles: 
Profile page is created when sign-up,  displaying user's information and the posts created by this user
* Functionalities:
  * Update personal information on profile page
  *	The username on the right top can be clicked and show the user's profile.
  *	The username show below each post can be clicked and show the user's profile.
* Steps:
  *	Update user model
  *	Update register and login forms with first/last name, email, avatar input
  *	Create RESTful routes: show and edit

# Password Reset
Password reset via email confirmation
* Steps: 
  *	npm install --save async nodemailer
  *	Update user model with resetPasswordToken and resetPasswordExpires
  *	Create password.js to send confirmation emails and update password
* The crypto module provides cryptographic functionality that includes a set of wrappers for OpenSSL's hash, HMAC, cipher, decipher, sign, and verify functions.
* Async is a utility module which provides straight-forward, powerful functions for working with asynchronous JavaScript.
* waterfall(tasks, callbackopt) : Runs the tasks array of functions in series, each passing their results to the next in the array. However, if any of the tasks pass an error to their own callback, the next function is not executed, and the main callback is immediately called with the error.

# Authorization:
*	One cannot edit or delete posts and comments created by other users
*	Hide the "edit/delete" button when the posts or comments are created by others 
```
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
```
# Manage Yummy Food posts with RESTful routes:
Display images, description, creator's name, price of food, created time, and comments. 
*	Creator and Admin can create, edit and delete posts
*	Upload campground photos
*	Display campground location on Google Maps

# Manage Yummy Food comments with RESTful routes:
Display creator's name, created time
*	Creator and Admin can create, edit and delete comments

# Image Upload
Update campground photos when creating/editing campgrounds
*	Improve image load time on the landing page using Cloudinary
* Step:
  *	
  ```sh
  npm install multer cloudinary
  ```
  *	update food model: image: {id: String, url: String}

# flash message
Display error/success message when login/logout/register/operations without Authorization
```sh
npm install -save connect-flash
```

# Full Screen Background Image Slider
Display a crossfade animation cycle to transition 5 background images with 10 second intervals uses HTML and CSS

# Post/Comments created time:
Display the time of posts/comments since created with Moment.js
* Steps:
  * In models/foods.js and models/comments.js, add  property in the Schema:
    ```
    createAt: { type: Date, default: Date.now},
    ```
    Then in food/show.ejs:
    ```
    <%= moment(campground.createdAt).fromNow() %>
    ```
  
# Deploy Yummy Food on Heroku
*	Initialization:  git init -> Add start script in package.json
*	Create MongoDB Atlas database searver(cluster)
*	Attension: Make sure the mongoDB shell of c9 has the same version as server.
*	Update: 
  ```sh
  git add -> git commit -m -> git push heroku master
  ```

# Future for the Project
UI improvements
Rating & Reviews

### Front-end

* [ejs](http://ejs.co/)
* [Google Maps APIs](https://developers.google.com/maps/)
* [Bootstrap](https://getbootstrap.com/docs/3.3/)

### Back-end

* [express](https://expressjs.com/)
* [mongoDB](https://www.mongodb.com/)
* [mongoose](http://mongoosejs.com/)
* [async](http://caolan.github.io/async/)
* [crypto](https://nodejs.org/api/crypto.html#crypto_crypto)
* [passport](http://www.passportjs.org/)
* [passport-local](https://github.com/jaredhanson/passport-local#passport-local)
* [express-session](https://github.com/expressjs/session#express-session)
* [method-override](https://github.com/expressjs/method-override#method-override)
* [nodemailer](https://nodemailer.com/about/)
* [moment](https://momentjs.com/)
* [cloudinary](https://cloudinary.com/)
* [geocoder](https://github.com/wyattdanger/geocoder#geocoder)
* [connect-flash](https://github.com/jaredhanson/connect-flash#connect-flash)

### Platforms

* [Cloudinary](https://cloudinary.com/)
* [Heroku](https://www.heroku.com/)
* [Cloud9](https://aws.amazon.com/cloud9/?origin=c9io)
