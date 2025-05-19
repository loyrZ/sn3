const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isLoggedIn } = require("../../middleware/auth");
const { getPostById, makeThumbnail, getCommentsByPostId, getRecentPosts} = require("../../middleware/posts");
const db = require("../../conf/database");
const pathToFFMPEG = require(`ffmpeg-static`);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/videos/uploads');
    },
    filename: function (req, file, cb) {
        const fileExt = file.mimetype.split("/")[1];
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExt}`);
    }
});

const uploader = multer({ storage: storage });

///posts/create
router.post('/create', isLoggedIn, uploader.single('videoUpload'), makeThumbnail, async function (req, res, next) {
    console.log(req.file);
    const userId = req.session.user.userId;
    const { title, description, textpost } = req.body;
    const { path, thumbnail } = req.file;

    if (!title || !description || !path || !textpost) {
        req.flash("error", "Post must have a title, description, text post, and video.");
        return req.session.save((err) => {
            if (err) return next(err);
            return res.redirect("/post");
        });
    }

    try {
        const [resultObj] = await db.query(
            `INSERT INTO posts (title, description, video, textpost, thumbnail, fk_user_id) 
            VALUES (?, ?, ?, ?, ?, ?);`,
            [title, description, path, textpost, thumbnail, userId]
        );

        if (resultObj.affectedRows === 1) {
            req.flash("success", "Your post has been created.");
            return req.session.save((err) => {
                if (err) return next(err);
                return res.redirect(`/posts/${resultObj.insertId}`);
            });
        } else {
            req.flash("error", "Your post could not be created.");
            return req.session.save((err) => {
                if (err) return next(err);
                return res.redirect('/post');
            });
        }
    } catch (err) {
        return next(err);
    }
});

router.post('/posttext', isLoggedIn, async function (req, res, next) {
    const userId = req.session.user.userId;
    const { title, textpost } = req.body;

    // Ensure that both title and textpost are provided
    if (!title || !textpost) {
        req.flash("error", "Post must have a title and body.");
        return req.session.save((err) => {
            if (err) return next(err);
            return res.redirect("/post");
        });
    }

    try {
        // Insert the text post into the 'posts' table, leaving the description, video, and thumbnail fields null
        const [resultObj] = await db.query(
            `INSERT INTO posts (title, textpost, fk_user_id) 
            VALUES (?, ?, ?);`,
            [title, textpost, userId]
        );

        if (resultObj.affectedRows === 1) {
            req.flash("success", "Your post has been created.");
            return req.session.save((err) => {
                if (err) return next(err);
                return res.redirect(`/posts/${resultObj.insertId}`);
            });
        } else {
            req.flash("error", "Your post could not be created.");
            return req.session.save((err) => {
                if (err) return next(err);
                return res.redirect('/post');
            });
        }
    } catch (err) {
        return next(err);
    }
});


///posts/:id    {{#each posts}}
//         {{>comment this}}
//     {{/each}}
router.get('/:id(\\d+)', getRecentPosts, getPostById, getCommentsByPostId, function (req, res, next) {
    res.render('viewpost', {
        title: 'View Post Routes/Posts',
        js: ['viewpost.js'],
        showNav: true,
        showHeader: false,
        showThumbBottom:true,
        showComment:true
    });
});

//localhost:3000/posts/search?searchterm=term
router.get("/search", async function (req, res, next) {
    try {
        const searchTerm = req.query.searchTerm;
        const [rows] = await db.query(`
         SELECT id, p.title, p.description, p.thumbnail, 
         CONCAT_WS(" ", p.title, p.description) as haystack
         FROM posts p
         HAVING haystack LIKE ?;`, [`%${searchTerm}%`]);

        res.locals.posts = rows;
        res.render('index', {
            title: 'CSC 317 App',
            js: ['index.js'],
            showNav: true,
            showHeader: false,
            name: "Gets Subroto",
            showThumb: true,
            searchTerm
        });
    } catch (err) {
        next(err);
    }
});

router.post("/like/:id(\\d+)", async function (req, res, next) {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                status: "error",
                message: "You must be logged in to like a post"
            });
        }

        const postId = req.params.id;
        const userId = req.session.user.userId;

        const [rows] = await db.query(`SELECT * FROM likes WHERE fk_post_id=? AND fk_user_id=?`, [postId, userId]);

        if (rows.length === 0) { // save new like
            const [insertRes] = await db.query(`INSERT INTO likes (fk_post_id, fk_user_id) VALUES (?, ?)`, [postId, userId]);

            if (insertRes.affectedRows === 1) {
                return res.status(201).json({
                    status: "success",
                    message: "Like saved",
                    isLiked: true,
                    likeCount: 1
                });
            } else {
                return res.json({
                    status: "error",
                    message: "Failed to save like"
                });
            }
        } else { // remove like
            const [deleteRes] = await db.query(`DELETE FROM likes WHERE fk_post_id=? AND fk_user_id=?`, [postId, userId]);

            if (deleteRes.affectedRows === 1) {
                return res.status(201).json({
                    status: "success",
                    message: "Like removed",
                    isLiked: false,
                    likeCount: 0
                });
            } else {
                return next("Something odd happened");
            }
        }
    } catch (err) {
        next(err);
    }
});

router.delete("/:id(\\d+)", async function (req, res, next) {
    // Implementation for deleting a post
    // Consider adding the code here if necessary
});

module.exports = router;
