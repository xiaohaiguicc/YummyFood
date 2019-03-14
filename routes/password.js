const express    = require("express"),
      router     = express.Router(),
      User       = require("../models/user"),
      async      = require("async"),
      nodemailer = require("nodemailer"),
      crypto     = require("crypto");
      
// forgot password
router.get("/forgot", function(req, res){
    res.render("password/forgot");
});

// send confirmation emails
router.post("/forgot", (req, res, next) => {
  // use waterfall to increase readability of the following callbacks
  async.waterfall([
    function(done) {
      // generate random token
      crypto.randomBytes(20, (err, buf) => {
        let token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      // find who made the request and assign the token to them
      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) throw err;
        if (!user) {
          req.flash("error", "That Yummy Food account doesn't exist.");
          return res.redirect("/forgot");
        }
        
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // ms, 1hour
        
        user.save(err => done(err, token, user));
      });
    },
    function(token, user, done) {
      // indicate email account and the content of the confirmation letter
      let smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "yummyfoodwebapp@gmail.com",
          pass: process.env.PASSWORD
        }
      });
      let mailOptions = {
        from: "yummyfoodwebapp@gmail.com",
        to: user.email,
        subject: "Reset your Yummy Food Password",
        text: "Hi " + user.firstName + ",\n\n" +
              "We've received a request to reset your password. If you didn't make the request, just ignore this email. Otherwise, you can reset your password using this link:\n\n" +
              "https://" + req.headers.host + "password/reset/" + token + "\n\n" +
              "Thanks.\n"+
              "The Yummy Food Team\n"
      };
      // send the email
      smtpTransport.sendMail(mailOptions, err => {
        if (err) throw err;
        console.log("mail sent");
        req.flash("success", "An email has been sent to " + user.email + " with further instructions.");
        done(err, "done");
      });
    }
  ], err => {
    if (err) return next(err);
    res.redirect("/forgot");
  });
});

// reset password ($gt -> selects those documents where the value is greater than)
router.get("/reset/:token", (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (err) throw err;
    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      res.redirect("/forgot");
    } else { res.render("password/reset", { token: req.params.token }) }
  });
});

// update password
router.post("/reset/:token", (req, res) => {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (err) throw err;
        if (!user) {
          req.flash("error", "Password reset token is invalid or has expired.");
          return res.redirect("/forgot");
        }
        // check password and confirm password
        if (req.body.password === req.body.confirm) {
          // reset password using setPassword of passport-local-mongoose
          user.setPassword(req.body.password, err => {
            if (err) throw err;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            
            user.save(err => {
              if (err) throw err;
              req.logIn(user, err => {
                done(err, user);
              });
            });
          });
        } else {
          req.flash("error", "Passwords do not match");
          return res.redirect("back");
        } 
      });
    },
    function(user, done) {
      let smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "yummyfoodwebapp@gmail.com",
          pass: process.env.PASSWORD
        }
      });
      let mailOptions = {
        from: "yummyfoodwebapp@gmail.com",
        to: user.email,
        subject: "Your Yummy Food Password has been changed",
        text: "Hi " + user.firstName + ",\n\n" +
              "This is a confirmation that the password for your account " + user.email + "  has just been changed.\n\n" +
              "Best,\n"+
              "The Yummy Food Team\n"
      };
      smtpTransport.sendMail(mailOptions, err => {
        if (err) throw err;
        req.flash("success", "Your password has been changed.");
        done(err);
      });
    },
  ], err => {
    if (err) throw err;
    res.redirect("/foods");
  });
});

module.exports = router;