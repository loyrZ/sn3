const db = require('../conf/database');
const { exec } = require('child_process');
const pathToFFMPEG = require('ffmpeg-static');
const path = require('path'); // Import path module

module.exports = {
    makeThumbnail: async function (req, res, next) {
        if (!req.file) {
            return next(new Error("File upload failed"));
        }
        try {
            // Define paths using path.join to ensure compatibility across platforms
            const destinationOfThumbnail = path.join(`public/images/uploads`, `thumbnail-${path.parse(req.file.filename).name}.png`);
            const thumbnailCommand = `"${pathToFFMPEG}" -ss 00:00:01 -i "${req.file.path}" -y -s 200x200 -vframes 1 -f image2 "${destinationOfThumbnail}"`;

            // Use a Promise-based approach for exec
            exec(thumbnailCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return next(error);
                }
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                req.file.thumbnail = destinationOfThumbnail;
                next();
            });
        } catch (error) {
            next(error);
        }
    },
    getProfileById: async function (req, res, next) {
        const userId = req.params.id;
        try {
            const [rows, _] = await db.execute(`
            SELECT u.id, u.profilepicture, u.username, u.email, u.display_name, u.created_at
            FROM users u 
            WHERE u.id = ?;
        `, [userId]);
            const user = rows[0];
            if (!user) {
                req.flash("error", "User not found.");
                return req.session.save((err) => {
                    if (err) next(err);
                    return res.redirect('/');
                });
            }
            res.locals.user = user;  // Store the user data in res.locals.user
            res.locals.profilePicture = user.profilepicture ? user.profilepicture : null;
            next();
        } catch (err) {
            next(err);
        }
    },


    getPostById: async function (req, res, next) {
        const postId = req.params.id; // Accessing the specific ID from the params
        try {
            const [rows, _] = await db.execute(`
        SELECT p.id, p.title, p.description, p.textpost, p.created_at, p.video, 
        u.username, (SELECT COUNT(*) FROM likes WHERE fk_post_id=?) as likes
        FROM posts p 
        JOIN users u 
        ON u.id = p.fk_user_id 
        WHERE p.id=?;`, [postId, postId]);

            const post = rows[0];
            if (!post) {
                req.flash("error", "This post does not exist");
            } else {
                res.locals.currentPost = post;
                next();
            }
        } catch (err) {
            next(err);
        }
    },
    getCommentsByPostId: async function (req, res, next) {
        try {
            const postId = req.params.id;
            const [commentsRows] = await db.execute(`
            SELECT c.id, c.text, c.created_at, u.username
            FROM videoapp.comments c
            JOIN videoapp.users u ON u.id = c.fk_user_id
            WHERE c.fk_post_id = ?
        `, [postId]);

            const comments = commentsRows;
            if (comments.length === 0) {
                req.flash("error", "No comments found for this post");
            }
            res.locals.comments = comments;
            next();
        } catch (err) {
            next(err);
        }
    },
    getRecentPosts: async function(req, res, next) {
    try{
        const[posts, _] = await db.query(
            `SELECT p.id, p.title, p.created_at, p.thumbnail, u.username
                FROM posts p 
                JOIN users u 
                ON u.id = p.fk_user_id 
                ORDER BY created_at desc
                LIMIT 16;`);
                res.locals.posts=posts;
                next();
    }catch(err){
            next(err);
        }
    },
    getAllPosts: async function(req, res, next) {
        try {
            const [posts, _] = await db.query(
                `SELECT p.id, p.title, p.created_at, p.thumbnail, u.username
            FROM posts p 
            JOIN users u 
            ON u.id = p.fk_user_id 
            ORDER BY created_at DESC;`  // Retrieves all posts ordered by most recent
            );
            res.locals.posts = posts;
            next();
        } catch (err) {
            next(err);
        }
    },
    getUserInformationById: async function (req, res, next) {
        const userId = req.params.id;  // Get the user ID from the URL
        try {
            const [rows, _] = await db.query(
                `SELECT u.username, u.profilepicture, u.email, u.display_name, u.created_at
            FROM users u
            WHERE u.id = ?;`, [userId]);

            const user = rows[0];  // Assuming rows is an array, get the first user

            if (!user) {
                req.flash("error", "User not found.");
                return res.redirect('/');  // Redirect if user is not found
            }

            // Debugging: Check if user data is retrieved
            console.log("User Data Retrieved ------------------------------------------- :", user);

            // Store the user information in res.locals for use in the next middleware or route handler
            res.locals.userArray = user;
            next();  // Call the next middleware
        } catch (err) {
            console.error("Error fetching user data:", err);
            next(err);  // Pass any errors to the error handler
        }
    },

    getPostsByUserId: async function (req, res, next) {
        const postUserId = req.params.fk_user_id; // Accessing the specific ID from the params
    },
};
