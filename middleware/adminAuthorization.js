/**
 *@swagger
 * components:
 *  responses:
 *      adminAuthorization:
 *          description: "You do not have permission to use this method !"
 */
module.exports.adminAuthorization = (req, res, next) => {
    try {
        if(req.user.role !== "admin"){
            throw new Error("Access denied");
        }
        next();
    } catch(e) {
        if(e.message === "Access denied") {
            res.status(403).json({error: "You do not have permission to use this method !"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    }
}