var express = require('express');
var router = express.Router();
const db = require('../../conf/database.js');
const bcrypt = require('bcrypt');
const {errorPrint, successPrint} = require('../../helpers/debug/debugprinters');
const {checkUsernameUnique, checkEmailUnique, checkUsername, checkPassword, checkEmail} = require('../../middleware/validation');
const{ isLoggedIn, isMyProfile } = require('../../middleware/auth');
const {getRecentPosts, getPostById, getProfilePictureById, getDisplayNameById, getProfileById} = require("../../middleware/posts");
const multer = require('multer');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/**
 * register user
 * localhost:3000/users/register
 */
router.post('/register',
    checkUsername,
    checkPassword,
    checkEmail,
    checkUsernameUnique,
    checkEmailUnique,
    async function (req, res, next) {
  var {username, profilepicture, email, password, confirmPassword} = req.body;
  try {
    var hashedPassword = await bcrypt.hash(password, 3)
    var [resultObj, _] = await db.query(`INSERT INTO users (username, profilepicture, email, password) VALUE (?, ?, ?, ?)`,
        [username, profilepicture, email, hashedPassword]);

    if(resultObj?.affectedRows == 1){
      successPrint(`${username} has been created`);
      return res.redirect('/login');
    } else {
      errorPrint(`${username} could not be created!!`);
      return res.redirect('/register');
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

/**
 * login user
 *
 */
router.post('/login', async function (req, res, next) {
  try {
    var { username, password } = req.body;
    var [rows, fields] = await db.query("SELECT * FROM users WHERE username=?;", [username]);
    const user = rows[0];
    if(!user){
      return res.redirect('/login');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if(passwordMatch){
      req.session.user ={
        username: user.username,
        userId: user.id,
        email: user.email
      };
      req.flash("success", `Hi ${user.username}, you are logged in`);
      req.session.save((err)=> {
        if (err) next(err);
        return res.redirect(`/profile/${user.id}`);
      })
    } else {
      req.flash("error", `Invalid Login Credentials`);
      req.session.save((err) => {
        if(err) next(err);
        res.redirect('/login');
      })
    }
  } catch (err) {
    console.log(err);
    next(err);  // Pass the error to the error handler
  }
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/profile');  // Destination folder for uploaded images
  },
  filename: function (req, file, cb) {
    const fileExt = file.mimetype.split("/")[1];  // Extract file extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;  // Create a unique filename
    cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExt}`);
  }
});

const uploader = multer({ storage: storage });

router.post('/edit', isLoggedIn, uploader.single('profilePicUpload'), async function (req, res, next) {
  const userId = req.session.user.userId;  // Get the logged-in user's ID from the session
  const profilepicture = req.file ? req.file.path : null;  // Get the uploaded file's path

  try {
    // Ensure the file was uploaded and exists
    if (!profilepicture) {
      req.flash('error', 'Please upload a valid image.');
      return res.redirect('/profile');
    }

    // Update the user's profile picture in the database
    const [resultObj] = await db.query(
        `UPDATE users SET profilepicture = ? WHERE id = ?`,
        [profilepicture, userId]
    );

    if (resultObj.affectedRows === 1) {
      req.flash("success", "Profile picture updated successfully.");
      return req.session.save((err) => {
        if (err) return next(err);
        return res.redirect(`/users/${userId}`);
      });
    } else {
      req.flash("error", "Failed to update profile picture.");
      return res.redirect('/users');
    }
  } catch (err) {
    return next(err);
  }
});

/**
 * logout user
 */
router.post('/logout', function (req, res, next) {
  return req.session.destroy(function (err){
    if(err) next(err);
    res.redirect('/')
  })
})


router.get('/edit', async function (req, res, next) {
  const user = res.locals.user;  // Access the user from res.locals.user
  res.render('edit');
})
/**
 * view profile
 */
router.get('/:id(\\d+)', isLoggedIn, isMyProfile, getRecentPosts, getProfileById, async function (req, res, next) {
  try {
    const user = res.locals.user;  // Access the user from res.locals.user

    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect('/users');
    }
    console.log(user, "ssssssssssssssssssssss")
    // Render the profile template and pass the user's data to it
    res.render('profile', {
      title: 'View Post Code Green',
      showNav: true,
      showHeader: false,
      showThumbBottom: true,
      user: user
    });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
