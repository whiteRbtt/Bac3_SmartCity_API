const pool = require('../modele/database');
const UserDB = require("../modele/userDB");
const EventDB = require("../modele/eventDB");
const ParticipationDB = require("../modele/participationDB");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Tools = require('../tools');
const UsersDB = require("../modele/userDB");

// Se logger
/**
 * @swagger
 *  components:
 *      securitySchemes:
 *          basicAuth:
 *              type: http
 *              scheme: basic
 *      responses:
 *          UserLoggedIn:
 *              description : Logged-in
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Successfully logged in
 *                              token:
 *                                  type: string
 *                                  description : TOKEN DATA
 *          InvalidMailAddress:
 *              description: "Mail address not found"
 *          InvalidPassword:
 *              description: "Invalid password"
 *          InvalidMailAddressFormat:
 *              description: "Invalid mail address, use the format : xxx@yyy.zz"
 *          InvalidPasswordFormat:
 *              description: "Invalid password, use between 6 and 32 characters"
 *          MissingLogin:
 *              description: "Please enter your login/password"
 */
module.exports.login = async (req, res) => {
    const client = await pool.connect();
    const autorization = req.get('authorization');
    try {
        if(!autorization || !autorization.includes('Basic')){
            throw new Error("Missing login");
        }
        // Enlever le basic dans l'authorization
        const coded_str = autorization.split(' ')[1];
        const uncoded_str = Buffer.from(coded_str, 'base64').toString('utf-8');
        const [mailAddress, password] = uncoded_str.split(':');
        if(!mailAddress.match(Tools.mailAddressRegex)){
            throw new Error("Invalid mail : format")
        }
        if(!password.match(Tools.passwordRegex)){
            throw new Error("Invalid password : format");
        }
        const {rows : users} = await UserDB.getUser(client, mailAddress);
        const user = users[0];
        if(!user){
            throw new Error("Invalid mail");
        }
        const stored_hashed_password = user.password;
        const passwordMatch = await bcrypt.compare(password, stored_hashed_password);
        if(!passwordMatch){
            throw new Error("Invalid password");
        }
        const token = generate_token(user);
        Tools.addValidToken(mailAddress, token);
        res.status(201).json({
            message : "Successfully logged in",
            token : token
        });
    } catch(e) {
        if(e.message === "Invalid mail"){
            res.status(404).json({error : "Mail address not found"});
        } else if(e.message === "Invalid mail : format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if(e.message === "Invalid password : format"){
            res.status(400).json({error : "Invalid password, use between 6 and 32 characters"});
        } else if(e.message === "Missing login"){
            res.status(401).json({error : "Please enter your login/password"});
        } else if(e.message === "Invalid password"){
            res.status(401).json({error : "Invalid password"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}

// ADMIN : Obtenir les infos de l'utilisateur
/**
 * @swagger
 *  components:
 *      responses:
 *          GetUser:
 *              description: Get user infos
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              user:
 *                                  type: object
 *                                  properties:
 *                                      mail_address:
 *                                          type: string
 *                                      password:
 *                                          type: string
 *                                      name:
 *                                          type: string
 *                                      birthdate:
 *                                          type: string
 *                                          format: date-time
 *                                      role:
 *                                          type: string
 *                                      profile_picture:
 *                                          type: string
 *          UserNotFound:
 *              description: "User not found"
 *          InvalidRequestParameters:
 *              description: "Invalid request parameters, please consult the documentation"
 *          InvalidTypesInTheRequest:
 *              description: "Invalid types in the request"
 *      parameters:
 *          GetUserMailAddress:
 *              in: query
 *              name: mailAddressUser
 *              schema:
 *                  type: string
 *              description: Mail Address of the user
 *              required: true
 */
module.exports.getUser = async (req, res) => {
    const client = await pool.connect();
    const {mailAddressUser} = req.query;
    try {
        if(!mailAddressUser){
            throw new Error("Invalid request parameters");
        }
        Tools.validationTypes([mailAddressUser]);
        if(!mailAddressUser.match(Tools.mailAddressRegex)){
            throw new Error("Invalid mail address format");
        }

        const {rows : users} = await UserDB.getUser(client, mailAddressUser);
        const user = users[0];
        if(!user){
            throw new Error("User not found");
        }
        res.status(200).json({user : user});
    } catch(e) {
        if(e.message === "Invalid mail address format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if(e.message === "Invalid request parameters"){
            res.status(400).json({error : "Invalid request parameters, please consult the documentation"});
        } else if(e.message === "User not found"){
            res.status(404).json({error : "User not found"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}

// Un utilisateur peut récupérer son image de profil
/**
 * @swagger
 *  components:
 *      responses:
 *          GetUserProfilePicture:
 *              description: Get profile picture
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              profile_picture:
 *                                  type: string
 */
module.exports.getProfilePicture = async (req, res) => {
    const client = await pool.connect();
    const mailAddress = req.user.mailAddress;
    try {
        const {rows : users} = await UsersDB.getProfilePicture(client, mailAddress);
        const user = users[0];
        if(!user.profile_picture){
            throw new Error("Profile picture not found");
        }
        res.status(200).json({profilePicture : user.profile_picture});
    } catch(e) {
        if(e.message === "Profile picture not found"){
            res.status(404).json({error : "Profile picture not found"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    }
}

// Obtenir tous les utilisateurs
/**
 * @swagger
 *  components:
 *      responses:
 *          GetAllUsers:
 *              description: Get every single user within db
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              users:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          mail_address:
 *                                              type: string
 *                                          password:
 *                                              type: string
 *                                          name:
 *                                              type: string
 *                                          birthdate:
 *                                              type: string
 *                                              format: date-time
 *                                          role:
 *                                              type: string
 */
module.exports.getAllUsers = async (req, res) => {
    const client = await pool.connect();
    try {
        const {rows : users} = await UserDB.getAllUsers(client);
        res.status(200).json({users : users});
    } catch(e) {
        console.error(e);
        res.status(500).json({error : "Server error"});
    } finally {
        client.release();
    }
}

// Obtenir les informations de l'utilisateur loggé
/**
 * @swagger
 *  components:
 *      responses:
 *         GetOwnUser:
 *              description: Get all users infos
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              user:
 *                                  type: object
 *                                  properties:
 *                                      mail_address:
 *                                          type: string
 *                                      name:
 *                                          type: string
 *                                      role:
 *                                          type: string
 */
module.exports.getOwnUser = (req, res) => {
    res.status(200).json({user : req.user});
}

// S'inscrire
// birthdate est une date format ISO-8601
/**
 * @swagger
 *  components:
 *      responses:
 *          UserInserted:
 *              description : User created
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: User inserted
 *                              token:
 *                                  type: string
 *                                  description : TOKEN DATA
 *          InvalidRequestBody:
 *              description: "Invalid request body, please consult the documentation"
 *          AlreadyLoggedIn:
 *              description: "Can not register user if you are logged in"
 *          AlreadyRegistered:
 *              description: "Address mail already registered"
 *          BirthdateAge:
 *              description: "Invalid birthdate, you must be at least 18"
 *          BirthdateWrongInput:
 *              description: "Invalid birthdate, day must be [1-31] and month [0-11] and year [1920-x]"
 *      requestBodies:
 *          UserToAdd:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              mailAddress:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                                  format: password
 *                              name:
 *                                  type: string
 *                              birthdate:
 *                                  type: string
 *                                  format: date-time
 *                          required:
 *                              - mailAddress
 *                              - password
 *                              - name
 *                              - birthdate
 */
module.exports.insertUser = async (req, res) => {
    const client = await pool.connect();
    const {mailAddress, password, name, birthdate} = req.body;
    try {
        if(req.user){
            throw new Error("Already logged in");
        }
        if(!mailAddress || !password || !name || !birthdate){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([mailAddress, password, name, birthdate]);
        if(!mailAddress.match(Tools.mailAddressRegex)){
            throw new Error("Invalid mail address format");
        }
        const userExists = await UsersDB.userExists(client, mailAddress);
        if(userExists){
            throw new Error("Already registered");
        }
        if(!password.match(Tools.passwordRegex)) {
            throw new Error("Invalid password");
        }

        const date = Tools.validationBirthdate(birthdate);
        // Cryptage du mot de passe
        const hashedPassword = await Tools.passwordHash(password);
        const {rows : users} = await UserDB.insertUser(client, mailAddress, hashedPassword, name, date, 'user');
        const user = users[0];
        const token = generate_token(user);
        Tools.addValidToken(mailAddress, token);
        res.status(201).json({message : "User inserted", token : token});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Already logged in"){
            res.status(400).json({error : "Can not register user if you are logged in"});
        } else if(e.message === "Invalid mail address format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if (e.message === "Already registered"){
            res.status(400).json({error : "Address mail already registered"});
        } else if (e.message === "Invalid password"){
            res.status(400).json({error : "Invalid password, use between 6 and 32 characters"});
        } else if (e.message === "Invalid birthdate : age"){
            res.status(400).json({error : "Invalid birthdate, you must be at least 18"});
        } else if (e.message === "Invalid birthdate : wrong input"){
            res.status(400).json({error : "Invalid birthdate, day must be [1-31] and month [0-11] and year [1920-x]"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}

// ADMIN : s'inscrire avec roles
/**
 * @swagger
 *  components:
 *      responses:
 *          UserInsertedAdmin:
 *              description : User created
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: User inserted
 *                              token:
 *                                  type: string
 *                                  description : TOKEN DATA
 *          AlreadyLoggedIn:
 *              description: "Can not register user if you are logged in"
 *          AlreadyRegistered:
 *              description: "Address mail already registered"
 *          InvalidRole:
 *              description: "Invalid role"
 *      requestBodies:
 *          UserToAddAdmin:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              mailAddress:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                                  format: password
 *                              name:
 *                                  type: string
 *                              birthdate:
 *                                  type: string
 *                                  format: date-time
 *                              role:
 *                                  type: string
 *                          required:
 *                              - mailAddress
 *                              - password
 *                              - name
 *                              - birthdate
 */
module.exports.insertUserAdmin = async (req, res) => {
    const client = await pool.connect();
    try {
        const {mailAddress, password, name, birthdate, role = "user"} = req.body;
        if(!mailAddress || !password || !name || !birthdate){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([mailAddress, password, name, birthdate, role]);
        if(!mailAddress.match(Tools.mailAddressRegex)){
            throw new Error("Invalid mail address format");
        }
        const userExists = await UsersDB.userExists(client, mailAddress);
        if(userExists){
            throw new Error("Already registered");
        }
        if(!password.match(Tools.passwordRegex)) {
            throw new Error("Invalid password");
        }
        if(!Tools.validRoles(role)){
            throw new Error("Invalid role");
        }

        const date = await Tools.validationBirthdate(birthdate);
        // Cryptage du mot de passe
        const hashedPassword = await Tools.passwordHash(password);
        const {rows : users} = await UserDB.insertUser(client, mailAddress, hashedPassword, name, date, role);
        const user = users[0];
        const token = generate_token(user);
        Tools.addValidToken(mailAddress, token);
        res.status(201).json({message : "User inserted", token : token});
    } catch(e) {
        if(e.message === "Invalid request body") {
            res.status(400).json({error: "Invalid request body"});
        } else if(e.message === "Invalid mail address format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if (e.message === "Already registered"){
            res.status(400).json({error : "Address mail already registered"});
        } else if (e.message === "Invalid password"){
            res.status(400).json({error : "Invalid password, use between 6 and 32 characters"});
        } else if (e.message === "Invalid birthdate : age"){
            res.status(400).json({error : "Invalid birthdate, you must be at least 18"});
        } else if (e.message === "Invalid birthdate : wrong input"){
            res.status(400).json({error : "Invalid birthdate, day must be [1-31] and month [0-11]"});
        } else if (e.message === "Invalid role"){
            res.status(400).json({error : "Invalid role"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}

// Modification du mot de passe d'un utilisateur
/**
 * @swagger
 *  components:
 *      responses:
 *          UserPasswordUpdate:
 *              description : User updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: User updated
 *                              user:
 *                                  type: object
 *                                  properties:
 *                                      mail_address:
 *                                          type: string
 *                                      password:
 *                                          type: string
 *                                          format: password
 *                                      name:
 *                                          type: string
 *                                      birthdate:
 *                                          type: string
 *                                          format: date-time
 *                                      role:
 *                                          type: string
 *                                      profile_picture:
 *                                          type: string
 *          InvalidNewPassword:
 *              description: "Invalid password, use between 6 and 32 characters"
 *          InvalidCurrentPassword:
 *              description: "Incorrect current password"
 *      requestBodies:
 *          UserPasswordUpdate:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              currentPassword:
 *                                  type: string
 *                                  format: password
 *                              newPassword:
 *                                  type: string
 *                                  format: password
 */
module.exports.updateUser = async (req, res) => {
    const client = await pool.connect();
    const mailAddress = req.user.mailAddress;
    const {currentPassword, newPassword} = req.body;
    try {
        if(!currentPassword || !newPassword){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([currentPassword, newPassword]);
        if(!newPassword.match(Tools.passwordRegex)){
            throw new Error("Invalid new password");
        }
        const {rows : users} = await UsersDB.getUser(client, mailAddress);
        const user = users[0];
        const passwordMatch = await bcrypt.compare(currentPassword, user.password)
        if(!passwordMatch){
            throw new Error("Incorrect current password");
        }
        const hashedNewPassword = await Tools.passwordHash(newPassword);
        const {rows : usersUpdated} = await UserDB.updateUser(client, mailAddress, mailAddress, user.name, hashedNewPassword, user.birthdate, user.role);
        const userUpdated = usersUpdated[0];
        res.status(200).json({message : "User updated", user : userUpdated});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error: "Invalid request body"});
        } else if(e.message === "Invalid new password"){
            res.status(400).json({error : "Invalid password, use between 6 and 32 characters"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else if(e.message === "Incorrect current password"){
            res.status(401).json({error : "Incorrect current password"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}

// Ajoute une photo de profil pour l'utilisateur courant
/**
 * @swagger
 *  components:
 *      responses:
 *          UserPictureUpdate:
 *              description : User updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: User updated
 *                              profilePicture:
 *                                   type: string
 *                                   description : resized picture
 *          InputBuffer:
 *              description: "Insupported file type"
 *      requestBodies:
 *          UserPictureUpdate:
 *              required: true
 *              content:
 *                  image/png:
 *                      schema:
 *                          type: string
 *                          format: binary
 */
module.exports.updateUserProfilePicture = async (req, res) => {
    const client = await pool.connect();

    const mailAddress = req.user.mailAddress;
    const avatar = req.files.avatar;
    try {
        if(!avatar){
            throw new Error("Invalid request body");
        }
        const picture = await UserDB.updateProfilePicture(client, mailAddress, avatar[0].buffer);
        res.status(200).json({message : "User updated", profilePicture : picture});
    } catch(e) {
        if(e.message === "Invalid request body") {
            res.status(400).json({error: "Invalid request body"});
        } else if (e.message === "Input buffer contains unsupported image format"){
            res.status(415).json({error: "Insupported file type"});
        } else {
            console.error(e.message);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }

}

// ADMIN : modifier les attributs d'un utilisateur
/**
 * @swagger
 *  components:
 *      responses:
 *          UserAdminUpdate:
 *              description : User updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: User updated
 *                              user:
 *                                  type: object
 *                                  properties:
 *                                      mail_address:
 *                                          type: string
 *                                      password:
 *                                          type: string
 *                                          format: password
 *                                      name:
 *                                          type: string
 *                                      birthdate:
 *                                          type: string
 *                                          format: date-time
 *                                      role:
 *                                          type: string
 *                                      profile_picture:
 *                                          type: string
 *          UserNotFound:
 *              description: "User not found"
 *      requestBodies:
 *          UserAdminUpdate:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              userMailAddress:
 *                                  type: string
 *                              newUserMailAddress:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                                  format: password
 *                              birthdate:
 *                                  type: string
 *                                  format: date-time
 *                              role:
 *                                  type: string
 */
module.exports.updateUserAdmin = async (req, res) => {
    const client = await pool.connect();
    let {userMailAddress, newUserMailAddress, name, password, birthdate, role} = req.body;
    try {
        if(!userMailAddress){
            throw new Error("Invalid request body");
        }
        if(!newUserMailAddress && !password && !birthdate && !role && !name){
            throw new Error("Nothing to update");
        }
        Tools.validationTypes([userMailAddress, newUserMailAddress, name, password, birthdate, role]);
        if(!userMailAddress.match(Tools.mailAddressRegex) || (newUserMailAddress && !newUserMailAddress.match(Tools.mailAddressRegex))){
            throw new Error("Invalid mail address format");
        }
        if(password && !password.match(Tools.passwordRegex)){
            throw new Error("Invalid new password");
        }
        if(role && !Tools.validRoles(role)){
            throw new Error("Invalid role");
        }

        await client.query("BEGIN;");
        const {rows : users} = await UsersDB.getUser(client, userMailAddress);
        const user = users[0];
        if(!user){
            throw new Error("User not found");
        }
        if(newUserMailAddress){
            const newUserExists = await UsersDB.userExists(client, newUserMailAddress);
            if(newUserExists){
                throw new Error("Already registered");
            }

            // Modifier les réservations de cet utilisateur
            const {rows : participations} = await ParticipationDB.getAllParticipationsUser(client, userMailAddress);
            for(const participation of participations){
                await ParticipationDB.updateParticipation(client, userMailAddress, participation.id_event, participation.register_date,
                    newUserMailAddress, participation.id_event);
            }

            // Modifier les événements créés par cet utilisateur
            const {rows : events} = await EventDB.getAllEventsCreatedByUser(client, userMailAddress);
            for(const event of events){
                await EventDB.updateEvent(client, event.name, event.id, event.starting_date, event.ending_date, event.street_name, event.house_number,
                    event.postal_code, event.city, event.children_accepted, event.description, event.type, event.security_level,
                    event.require_mask, event.require_covid_safe_ticket, event.max_place_count, newUserMailAddress);
            }
        }
        let date, hashedPassword;
        if(birthdate){
            date = Tools.validationBirthdate(birthdate);
        }
        if(password){
            hashedPassword = await Tools.passwordHash(password);
        }
        newUserMailAddress = newUserMailAddress ?? userMailAddress;
        hashedPassword = hashedPassword ?? user.password;
        birthdate = birthdate ?? user.birthdate;
        role = role ?? user.role;
        name = name ?? user.name;

        const {rows : usersUpdated} = await UserDB.updateUser(client, userMailAddress, newUserMailAddress, name, hashedPassword, birthdate, role);
        const userUpdated = usersUpdated[0];
        await client.query("COMMIT;");
        res.status(200).json({message : "User updated", user : userUpdated});
    } catch(e) {
        await client.query("ROLLBACK;");
        if(e.message === "Invalid request body") {
            res.status(400).json({error: "Invalid request body"});
        } else if(e.message === "Nothing to update") {
            res.status(400).json({error : "No updatable attribute"});
        } else if(e.message === "Invalid mail address format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if (e.message === "Already registered"){
            res.status(400).json({error : "Address mail already registered"});
        } else if (e.message === "Invalid new password"){
            res.status(400).json({error : "Invalid new password, use between 6 and 32 characters"});
        } else if (e.message === "User not found"){
            res.status(404).json({error : "User not found"});
        } else if (e.message === "Invalid birthdate : age"){
            res.status(400).json({error : "Invalid birthdate, you must be at least 18"});
        } else if (e.message === "Invalid birthdate : wrong input"){
            res.status(400).json({error : "Invalid birthdate, day must be [1-31] and month [0-11]"});
        } else if (e.message === "Invalid role"){
            res.status(400).json({error : "Invalid role"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}

// ADMIN : supprimer un utilisateur
// Supposition : si un admin supprime un utilisateur ayant créer des events : cet admin devient propriétaire de ses events
/**
 * @swagger
 *  components:
 *      responses:
 *          DeleteUser:
 *              description: User deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: User deleted
 *          CannotDelete:
 *              description: "You cannot delete yourself !"
 *      requestBodies:
 *          DeleteUser:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              mailAddress:
 *                                  type: string
 */
module.exports.deleteUser = async (req, res) => {
    const client = await pool.connect();
    try {
        const {mailAddress} = req.body;
        if(!mailAddress){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([mailAddress]);
        if(!mailAddress.match(Tools.mailAddressRegex)){
            throw new Error("Invalid mail address format");
        }
        if(mailAddress === req.user.mailAddress){
            throw new Error("Cannot delete");
        }
        await client.query("BEGIN;");
        const userExists = await UsersDB.userExists(client, mailAddress);
        if(!userExists){
            throw new Error("User not found");
        }

        // Traitement des events créés par l'utilisateur à supprimer => passe sur le compte de l'admin qui le supprime
        const {rows : eventsOwned} = await EventDB.getAllEventsCreatedByUser(client, mailAddress);
        for(const event of eventsOwned){
            await EventDB.updateEvent(client, event.id, event.starting_date, event.ending_date, event.street_name, event.house_number,
                event.postal_code, event.city, event.children_accepted, event.description, event.type, event.security_level,
                event.require_mask, event.require_covid_safe_ticket, event.max_place_count, req.user.mailAddress);
        }

        // Suppression de toutes ses participations
        await ParticipationDB.deleteAllParticipationsUser(client, mailAddress);

        await UserDB.deleteUser(client, mailAddress);
        await client.query("COMMIT;");
        Tools.deleteValidTokens(mailAddress);
        res.status(200).json({message : "User deleted"});
    } catch(e) {
        await client.query("ROLLBACK;");
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Cannot delete"){
            res.status(400).json({error : "You cannot delete yourself !"});
        } else if(e.message === "User not found"){
            res.status(404).json({error : "User not found"});
        } else if(e.message === "Invalid mail address format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}

function generate_token(user){
    const tokenData = {
        "mailAddress" : user.mail_address,
        "name" : user.name,
        "role" : user.role
    };
    const token = jwt.sign({
        data: tokenData,
    }, process.env.TOKEN_KEY, {
        expiresIn: '12h'
    });
    return token;
}
