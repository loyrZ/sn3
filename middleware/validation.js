const db = require("../conf/database");
const {errorPrint} = require("../helpers/debug/debugprinters");
module.exports = {
    checkUsername: async function (req, res,next){
        next();
    },
    checkEmail: async function (req, res,next){
        next();
    },
    checkPassword: async function (req, res,next){
        next();
    },
    checkUsernameUnique: async function (req, res,next){
        const username = req.body.username;
        var[rows, _] = await db.query(`select * from users where username=?`, [username]);
        if(rows?.length == 1){
            errorPrint(`${userId} already exists`);
            return res.redirect('/register');
        }else{
            next();
        }
    },
    checkEmailUnique: async function (req, res,next){
        const email = req.body.email;
        var [rows, fields] = await db.query(`SELECT * FROM users where email=?;`, [email]);
        if(rows?.length > 0){
            errorPrint('email already exists');
            return res.redirect('/register');
        }else{
            next();
        }
    },
}