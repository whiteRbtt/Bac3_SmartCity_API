const UserController = require("../../controleur/userDB");
const ParticipationRouter = require('./participation');
const Identification = require("../../middleware/identification");
const AdminAuthorization = require("../../middleware/adminAuthorization");

const Router = require("express-promise-router");
const router = new Router;

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({limits: {
        // limits : 50ko
        fileSize : 50000
    },
    storage : storage
});

router.use("/reservation", ParticipationRouter);

// Partie gestion utilisateur
/**
 * @swagger
 * /user/:
 *  get:
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/GetUserMailAddress'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetUser'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidMailAddressFormat'
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/InvalidRequestParameters'
 *                               - $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/MissingJWT'
 *                              - $ref: '#/components/responses/ExpiredJWT'
 *                              - $ref: '#/components/responses/UnvalidedJWT'
 *          403:
 *              $ref: '#/components/responses/adminAuthorization'
 *          404:
 *              $ref: '#/components/responses/UserNotFound'
 *          500:
 *              description: Server error
 *
 */
router.get('/', Identification.identification, AdminAuthorization.adminAuthorization, UserController.getUser);
/**
 * @swagger
 * /user/account/:
 *  get:
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetOwnUser'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/MissingJWT'
 *                              - $ref: '#/components/responses/ExpiredJWT'
 *                              - $ref: '#/components/responses/UnvalidedJWT'
 *          500:
 *              description: Server error
 *
 */
router.get('/account', Identification.identification, UserController.getOwnUser);
/**
 * @swagger
 * /user/account/picture:
 *  get:
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetUserProfilePicture'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/MissingJWT'
 *                              - $ref: '#/components/responses/ExpiredJWT'
 *                              - $ref: '#/components/responses/UnvalidedJWT'
 *          500:
 *              description: Server error
 *
 */
router.get('/account/picture', Identification.identification, UserController.getProfilePicture);
/**
 * @swagger
 * /user/all:
 *  get:
 *      tags:
 *          - User
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetAllUsers'
 *          400:
 *              $ref: '#/components/responses/ErrorJWT'
 *          401:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/MissingJWT'
 *                              - $ref: '#/components/responses/ExpiredJWT'
 *                              - $ref: '#/components/responses/UnvalidedJWT'
 *          403:
 *              $ref: '#/components/responses/adminAuthorization'
 *          500:
 *              description: Server error
 *
 */
router.get('/all', Identification.identification, AdminAuthorization.adminAuthorization, UserController.getAllUsers);
/**
 * @swagger
 * /user/login:
 *  post:
 *      tags:
 *          - User
 *      security:
 *          - basicAuth: []
 *      responses:
 *          201:
 *              $ref: '#/components/responses/UserLoggedIn'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidMailAddressFormat'
 *                               - $ref: '#/components/responses/InvalidPasswordFormat'
 *          401:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidPassword'
 *                               - $ref: '#/components/responses/MissingLogin'
 *          404:
 *              $ref: '#/components/responses/InvalidMailAddress'
 *          500:
 *              description: Server error
 *
 */
router.post('/login', UserController.login);
/**
 * @swagger
 * /user/register:
 *  post:
 *      tags:
 *          - User
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/UserInserted'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidRequestBody'
 *                               - $ref: '#/components/responses/InvalidMailAddressFormat'
 *                               - $ref: '#/components/responses/AlreadyLoggedIn'
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/AlreadyRegistered'
 *                               - $ref: '#/components/responses/InvalidPassword'
 *                               - $ref: '#/components/responses/BirthdateAge'
 *                               - $ref: '#/components/responses/BirthdateWrongInput'
 *          500:
 *              description: Server error
 *
 */
router.post('/register', UserController.insertUser);
/**
 * @swagger
 * /user/admin/register:
 *  post:
 *      tags:
 *          - User
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserToAddAdmin'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/UserInsertedAdmin'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidRequestBody'
 *                               - $ref: '#/components/responses/InvalidMailAddressFormat'
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/AlreadyRegistered'
 *                               - $ref: '#/components/responses/InvalidPassword'
 *                               - $ref: '#/components/responses/BirthdateAge'
 *                               - $ref: '#/components/responses/BirthdateWrongInput'
 *                               - $ref: '#/components/responses/InvalidRole'
 *          403:
 *              $ref: '#/components/responses/adminAuthorization'
 *          500:
 *              description: Server error
 *
 */
router.post('/admin/register', Identification.identification, AdminAuthorization.adminAuthorization, UserController.insertUserAdmin);
/**
 * @swagger
 * /user/account/update:
 *  patch:
 *      tags:
 *          - User
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserPasswordUpdate'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/UserPasswordUpdate'
 *          400:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/InvalidRequestBody'
 *                              - $ref: '#/components/responses/InvalidNewPassword'
 *                              - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *          401:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/MissingJWT'
 *                              - $ref: '#/components/responses/ExpiredJWT'
 *                              - $ref: '#/components/responses/UnvalidedJWT'
 *                              - $ref: '#/components/responses/InvalidCurrentPassword'
 *          500:
 *              description: Server error
 *
 */
router.patch('/account/update', Identification.identification, UserController.updateUser);
/**
 * @swagger
 * /user/account/admin/update:
 *  patch:
 *      tags:
 *          - User
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserAdminUpdate'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/UserAdminUpdate'
 *          400:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/InvalidRequestBody'
 *                              - $ref: '#/components/responses/InvalidNewPassword'
 *                              - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                              - $ref: '#/components/responses/NothingToUpdate'
 *                              - $ref: '#/components/responses/InvalidMailAddressFormat'
 *                              - $ref: '#/components/responses/AlreadyRegistered'
 *                              - $ref: '#/components/responses/BirthdateAge'
 *                              - $ref: '#/components/responses/BirthdateWrongInput'
 *                              - $ref: '#/components/responses/InvalidRole'
 *          401:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/MissingJWT'
 *                              - $ref: '#/components/responses/ExpiredJWT'
 *                              - $ref: '#/components/responses/UnvalidedJWT'
 *          403:
 *              $ref: '#/components/responses/adminAuthorization'
 *          404:
 *              $ref: '#/components/responses/UserNotFound'
 *          500:
 *              description: Server error
 *
 */
router.patch('/account/admin/update', Identification.identification, AdminAuthorization.adminAuthorization, UserController.updateUserAdmin);
/**
 * @swagger
 * /user/account/profilePicture:
 *  patch:
 *      tags:
 *          - User
 *      requestBody:
 *          $ref: '#/components/requestBodies/UserPictureUpdate'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/UserPictureUpdate'
 *          400:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/InvalidRequestBody'
 *          401:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/MissingJWT'
 *                              - $ref: '#/components/responses/ExpiredJWT'
 *                              - $ref: '#/components/responses/UnvalidedJWT'
 *          413:
 *              description : "File too large"
 *          415:
 *              $ref: '#/components/responses/InputBuffer'
 *          500:
 *              description: Server error
 *
 */
router.patch('/account/profilePicture', Identification.identification, upload.fields([
    {name: "avatar", maxCount: 1}
]), UserController.updateUserProfilePicture);
/**
 * @swagger
 * /user/delete:
 *  delete:
 *      tags:
 *          - User
 *      requestBody:
 *          $ref: '#/components/requestBodies/DeleteUser'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/DeleteUser'
 *          400:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/InvalidRequestBody'
 *                              - $ref: '#/components/responses/InvalidMailAddressFormat'
 *                              - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                              - $ref: '#/components/responses/CannotDelete'
 *          401:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/MissingJWT'
 *                              - $ref: '#/components/responses/ExpiredJWT'
 *                              - $ref: '#/components/responses/UnvalidedJWT'
 *          403:
 *              $ref: '#/components/responses/adminAuthorization'
 *          404:
 *              $ref: '#/components/responses/UserNotFound'
 *          500:
 *              description: Server error
 *
 */
router.delete('/delete', Identification.identification, AdminAuthorization.adminAuthorization, UserController.deleteUser);

// https://expressjs.com/fr/guide/error-handling.html
router.use((err, req, res, next) => {
    if(err.message === "File too large"){
        res.status(413).json({error: err.message})
    }
})


module.exports = router;
