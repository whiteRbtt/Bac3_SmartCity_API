require('dotenv').config();
const jwt = require('jsonwebtoken');
const Tools = require('../tools');

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *  responses:
 *      ErrorJWT:
 *          description: "Unvalid token data"
 *      MissingJWT:
 *          description: "Missing token"
 *      ExpiredJWT:
 *          description: "Expired token"
 *      UnvalidedJWT:
 *          description: "This token is not valid : user deleted or server reboot"
 */
module.exports.identification = (req, res, next) => {
    const authorization = req.get('authorization');
    try {
        if(!authorization || !authorization.includes('Bearer')){
            throw new Error("Missing token");
        }
        const coded_token = authorization.split(' ')[1];
        const decoded_token = jwt.verify(coded_token, process.env.TOKEN_KEY);

        req.user = decoded_token.data;
        if(!Tools.validToken(req.user.mailAddress, coded_token)){
            throw new Error("Not a valid token");
        }
        next();
    } catch(e) {
        if (e.message === "Missing token") {
            res.status(401).json({error: "Missing token"});
        } else if (e.name === "JsonWebTokenError") {
            res.status(401).json({error: "Unvalid token data"});
        } else if(e.name === 'TokenExpiredError'){
            res.status(401).json({error : "Expired token"});
        } else if(e.message === "Not a valid token"){
            res.status(401).json({error : "This token is not valid : user deleted or server reboot"});
        } else {
            res.status(500).json({error : "Server error"});
        }
    }
}