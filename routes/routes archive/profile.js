const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isLoggedIn, isMyProfile } = require("../../middleware/auth");
const db = require('../../conf/database');
const bcrypt = require('bcrypt');
const { errorPrint, successPrint } = require('../../helpers/debug/debugprinters');
const { checkUsernameUnique, checkEmailUnique, checkUsername, checkPassword, checkEmail } = require('../../middleware/validation');
const { getRecentPosts, getPostById, getProfilePictureById, getDisplayNameById, getProfileById, getAllUsers, getAllUsersInformation, getUserInformationById } = require("../../middleware/posts");


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

// Route to handle profile picture upload and update
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


router.get('/edit', async function (req, res, next) {
    const user = res.locals.user;  // Access the user from res.locals.user
    res.render('edit');
})

router.get('/:id(\\d+)', isLoggedIn, getProfileById, async function (req, res, next) {
        // Render the profile template and pass the user data to it
        const infoArray = res.locals.userArray;

        res.render('profile', {
            infoArray,
            title: 'User Profile',  // Additional data if needed
            showNav: true,  // You can pass other flags like showNav, etc.
            showHeader: false,
            showProfileCard:true,
        });

});

router.get('/:id/edit', isLoggedIn, isMyProfile, async function (req, res, next) {
    const userId = req.params.id;

    try {
        const [rows, _] = await db.execute(`
            SELECT id, username, email, display_name, profilepicture
            FROM users 
            WHERE id = ?;
        `, [userId]);

        const user = rows[0];

        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/profile/' + userId);
        }

        // Render the edit profile page, passing the user data to the template
        res.render('editProfile', {
            title: 'Edit Profile',
            user: user
        });
    } catch (err) {
        next(err);
    }
});

router.post('/:id/edit', isLoggedIn, isMyProfile, async function (req, res, next) {
    const userId = req.params.id;
    const { username, email, display_name } = req.body;

    try {
        const [result] = await db.execute(`
            UPDATE users 
            SET username = ?, email = ?, display_name = ?
            WHERE id = ?;
        `, [username, email, display_name, userId]);

        // Check if the update was successful
        if (result.affectedRows === 0) {
            req.flash('error', 'Failed to update profile.');
            return res.redirect('/profile/' + userId + '/edit');
        }

        req.flash('success', 'Profile updated successfully.');
        res.redirect('/profile/' + userId);
    } catch (err) {
        next(err);
    }
});










module.exports = router;
