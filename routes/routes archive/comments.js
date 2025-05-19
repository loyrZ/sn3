const express = require('express');
const { isLoggedIn } = require('../../middleware/auth');
const router = express.Router();
const db=require('../../conf/database');

router.post('/create', async function (req, res, next) {
    try {
        if (!req.session.user) {
            return res.json({
                status: "error",
                message: "You must be logged in to make a comment"
            }).status(401);
        }

        const { postId, text } = req.body;
        const userId = req.session.user.userId;
        const createdAt = new Date(); // Current date and time

        const [insertRes, _] = await db.query(`
            INSERT INTO comments (text, fk_post_id, fk_user_id, created_at)
            VALUES (?, ?, ?, ?)
        `, [text, postId, userId, createdAt]);

        if (insertRes?.affectedRows == 1) {
            return res.json({
                status: "success",
                text,
                postId,
                username: req.session.user.username
            });
        } else {
            return res.json({
                status: "error",
                message: "Comment could not be saved"
            });
        }
    } catch (err) {
        next(err);
    }
});


module.exports = router;
