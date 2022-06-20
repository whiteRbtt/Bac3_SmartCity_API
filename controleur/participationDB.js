const pool = require('../modele/database');
const EventDB = require('../modele/eventDB');
const ParticipationDB = require('../modele/participationDB');
const UsersDB = require('../modele/userDB');
const Tools = require('../tools');
const StandDB = require("../modele/standDB");

// ADMIN : Obtenir des infos sur une réservation
/**
 * @swagger
 *  components:
 *      responses:
 *          GetParticipation:
 *              description: Register matching given eventId
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              registerDate:
 *                                  type: string
 *                                  format: date-time
 *          ParticipationNotFound:
 *              description: "Participation not found"
 *      parameters:
 *          GetMailAddress:
 *              in: query
 *              name: mailAddress
 *              schema:
 *                  type: string
 *              description: Mail address of the user
 *              required: true
 *          GetEventId:
 *              in: query
 *              name: idEvent
 *              schema:
 *                  type: string
 *              description: ID of the event
 *              required: true
 */
module.exports.getParticipation = async (req, res) => {
    const client = await pool.connect();
    let {mailAddress, idEvent} = req.query;
    try {
        if(!idEvent || !mailAddress){
            throw new Error("Invalid request parameters");
        }
        Tools.validationTypes([], [Number(idEvent)]);
        if(!mailAddress.match(Tools.mailAddressRegex)){
            throw new Error("Invalid mail address format");
        }
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }
        const userExists = await UsersDB.userExists(client, mailAddress);
        if(!userExists){
            throw new Error("User not found");
        }
        const {rows : participations} = await ParticipationDB.getParticipation(client, mailAddress, idEvent);
        const participation = participations[0];
        if(!participation){
            throw new Error("Participation not found");
        }
        res.status(200).json({registerDate : participation.register_date});
    } catch(e) {
        if(e.message === "Invalid request parameters"){
            res.status(400).json({error : "Invalid request parameters, please consult the documentation"});
        } else if(e.message === "Invalid mail address format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error : "Event not found"});
        } else if(e.message === "User not found"){
            res.status(404).json({error : "User not found"});
        } else if(e.message === "Participation not found"){
            res.status(404).json({error : "Participation not found"});
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

// Obtenir des infos sur une réservation de l'utilisateur loggé
/**
 * @swagger
 *  components:
 *      responses:
 *          GetParticipationUser:
 *              description: Get a participation
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              registerDate:
 *                                  type: string
 *                                  format: date-time
 */
module.exports.getParticipationUser = async (req, res) => {
    const client = await pool.connect();
    const mailAddress = req.user.mailAddress;
    let {idEvent} = req.query;
    try {
        if(!idEvent){
            throw new Error("Invalid request parameters");
        }
        Tools.validationTypes([], [Number(idEvent)]);
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }
        const {rows : participations} = await ParticipationDB.getParticipation(client, mailAddress, idEvent);
        const participation = participations[0];
        if(!participation){
            throw new Error("Participation not found");
        }
        res.status(200).json({registerDate : participation.register_date});
    } catch(e) {
        if(e.message === "Invalid request parameters"){
            res.status(400).json({error : "Invalid request parameters, please consult the documentation"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error : "Event not found"});
        } else if(e.message === "Participation not found"){
            res.status(404).json({error : "Participation not found"});
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
// Obtenir des chaque participation pour chaque utilisateur
/**
 * @swagger
 *  components:
 *      responses:
 *          GetAllParticipations:
 *              description: Get every single register within the db
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              participations:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          mail:
 *                                              type: string
 *                                          eventId:
 *                                              type: integer
 *                                          eventName:
 *                                              type: string
 *                                          registerDate:
 *                                              type: string
 *                                              format: date-time
 */
module.exports.getAllParticipations = async (req, res) => {
    const client = await pool.connect();
    try {
        const { rows: participations } = await ParticipationDB.getAllParticipations(client);
        res.status(200).json({ participations: participations });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
};
// Obtenir des infos sur toutes les événements réservés de l'utilisateur loggé :
// passées, et à venir
/**
 * @swagger
 *  components:
 *      responses:
 *          GetAllEventsParticipationUser:
 *              description: Get all participations user sorted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              oldEvents:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                          name:
 *                                              type: string
 *                                          starting_date:
 *                                              type: string
 *                                              format: date-time
 *                                          ending_date:
 *                                              type: string
 *                                              format: date-time
 *                                          street_name:
 *                                              type: string
 *                                          postal_code:
 *                                              type: integer
 *                                          city:
 *                                              type: string
 *                                          children_accepted:
 *                                              type: boolean
 *                                          description:
 *                                              type: string
 *                                          security_level:
 *                                              type: integer
 *                                          require_mask:
 *                                              type: boolean
 *                                          require_covid_safe_ticket:
 *                                              type: boolean
 *                                          max_place_count:
 *                                              type: integer
 *                                          mail_address_creator:
 *                                              type: string
 *                                          count:
 *                                              type: integer
 *                                          stand_count:
 *                                              type: integer
 *                              upcomingEvents:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                          name:
 *                                              type: string
 *                                          starting_date:
 *                                              type: string
 *                                              format: date-time
 *                                          ending_date:
 *                                              type: string
 *                                              format: date-time
 *                                          street_name:
 *                                              type: string
 *                                          postal_code:
 *                                              type: integer
 *                                          city:
 *                                              type: string
 *                                          children_accepted:
 *                                              type: boolean
 *                                          description:
 *                                              type: string
 *                                          security_level:
 *                                              type: integer
 *                                          require_mask:
 *                                              type: boolean
 *                                          require_covid_safe_ticket:
 *                                              type: boolean
 *                                          max_place_count:
 *                                              type: integer
 *                                          mail_address_creator:
 *                                              type: string
 *                                          count:
 *                                              type: integer
 *                                          stand_count:
 *                                              type: integer
 */
module.exports.getAllEventsParticipationUser = async (req, res) => {
    const client = await pool.connect();
    const now = new Date();
    const mailAddress = req.user.mailAddress;
    try {
        const {rows : participations} = await ParticipationDB.getAllParticipationsUser(client, mailAddress);
        const oldEvents = [];
        const upcomingEvents = [];
        for(const participation of participations){
            const idEvent = participation.id_event;
            const {rows : events} = await EventDB.getEvent(client, idEvent);
            const event = events[0];

            const {rows : participationsCount} = await ParticipationDB.getParticipationCountEvent(client, idEvent);
            event["count"] = parseInt(participationsCount[0].participation_count);

            const {rowCount : standCount} = await StandDB.getAllStandsEvent(client, idEvent);
            event["stand_count"] = standCount;

            const endingDate = new Date(event.ending_date);
            if(endingDate < now){
                oldEvents.push(event);
            } else {
                upcomingEvents.push(event);
            }
        }
        res.status(200).json({oldEvents : oldEvents, upcomingEvents : upcomingEvents});
    } catch(e) {
        console.error(e);
        res.status(500).json({error : "Server error"});
    } finally {
        client.release();
    }
}

// ADMIN : Obtenir des infos sur toutes les réservations d'un événement
/**
 * @swagger
 *  components:
 *      responses:
 *          GetAllParticipationsEvent:
 *              description: Get all participations event
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              participations:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          mail_address_user:
 *                                              type: string
 *                                          register_date:
 *                                              type: string
 *                                              format: date-time
 */
module.exports.getAllParticipationsEvent = async (req, res) => {
    const client = await pool.connect();
    let {idEvent} = req.query;
    try {
        if(!idEvent){
            throw new Error("Invalid request parameters");
        }
        Tools.validationTypes([], [Number(idEvent)]);
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }

        const {rows : participations} = await ParticipationDB.getAllParticipationsEvent(client, idEvent);
        res.status(200).json({participations : participations})
    } catch(e) {
        if (e.message === "Invalid request parameters") {
            res.status(400).json({error: "Invalid request parameters, please consult the documentation"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error: "Event not found"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}

// Obtenir le nombre de places déjà réservées pour un événement
/**
 * @swagger
 *  components:
 *      responses:
 *          GetParticipationsCountEvent:
 *              description: Get participation count event
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              participationInfos:
 *                                  type: object
 *                                  properties:
 *                                      participation_count:
 *                                          type: integer
 */
module.exports.getParticipationsCountEvent = async (req, res) => {
    const client = await pool.connect();
    let {idEvent} = req.query;
    try {
        if(!idEvent){
            throw new Error("Invalid request parameters");
        }
        Tools.validationTypes([], [Number(idEvent)]);
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }
        const {rows : participations} = await ParticipationDB.getParticipationCountEvent(client, idEvent);
        const participation = participations[0];
        participation.participation_count = parseInt(participation.participation_count);
        res.status(200).json({participationInfos : participation});
    } catch(e) {
        if(e.message === "Invalid request parameters"){
            res.status(400).json({error : "Invalid request parameters, please consult the documentation"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error : "Event not found"});
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

// Obtenir des infos sur les réservations de l'utilisateur loggé sur une période de temps
/**
 * @swagger
 *  components:
 *      responses:
 *          GetParticipationsBetween:
 *              description: Get participations between dates
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              participations:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id_event:
 *                                              type: integer
 *                                          register_date:
 *                                              type: string
 *                                              format: date-time
 *          IncoherentDates:
 *              description: "Incoherent dates"
 *      parameters:
 *          GetStartingDate:
 *              in: query
 *              name: startingDate
 *              schema:
 *                  type: string
 *                  format: date-time
 *              description: Starting date
 *              required: true
 *          GetEndingDate:
 *              in: query
 *              name: endingDate
 *              schema:
 *                  type: string
 *                  format: date-time
 *              description: Ending Date
 *              required: true
 */
module.exports.getParticipationsUserBetween = async (req, res) => {
    const client = await pool.connect();
    const mailAddress = req.user.mailAddress;
    const {startingDate, endingDate} = req.query;
    try {
        if(!startingDate || !endingDate){
            throw new Error("Invalid request parameters");
        }
        Tools.validationTypes([startingDate, endingDate]);
        const startingDateConverted = new Date(startingDate);
        const endingDateConverted = new Date(endingDate);
        if(startingDateConverted == "Invalid Date" || endingDateConverted == "Invalid Date"){
            throw new Error("Invalid Date");
        }
        if(endingDateConverted <= startingDateConverted){
            throw new Error("Incoherent dates");
        }
        const {rows : participations} = await ParticipationDB.getParticipationsUserBetween(client, mailAddress, startingDateConverted, endingDateConverted);
        res.status(200).json({participations : participations})
    } catch(e) {
        if(e.message === "Invalid request parameters"){
            res.status(400).json({error : "Invalid request parameters, please consult the documentation"});
        } else if(e.message === "Incoherent dates") {
            res.status(400).json({error : "Incoherent dates"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else if(e.message === "Invalid Date"){
            res.status(400).json({error : "Invalid dates in the request"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}

// L'utilisateur loggé s'inscrit à un événement
/**
 * @swagger
 *  components:
 *      responses:
 *          ParticipationInserted:
 *              description : Participation created
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Participation created
 *                              participation:
 *                                  type: object
 *                                  properties:
 *                                      mail_address_user:
 *                                          type: string
 *                                      id_event:
 *                                          type: integer
 *                                      register_date:
 *                                          type: string
 *                                          format: date-time
 *          ParticipationAlreadyRegistered:
 *              description: "Participation already registered for this event"
 *      requestBodies:
 *          ParticipationToAdd:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idEvent:
 *                                  type: integer
 *                          required:
 *                              - idEvent
 */
module.exports.insertParticipation = async (req, res) => {
    const client = await pool.connect();
    const mailAddress = req.user.mailAddress;
    const {idEvent} = req.body;
    try {
        if(!idEvent){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([], [idEvent]);
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }
        const participationExists = await ParticipationDB.participationExists(client, mailAddress, idEvent);
        if(participationExists){
            throw new Error("Participation already registered");
        }
        const {rows : participations} = await ParticipationDB.insertParticipation(client, mailAddress, idEvent, new Date());
        const participation = participations[0];
        res.status(201).json({message : "Participation created", participation : participation});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Participation already registered") {
            res.status(400).json({error : "Participation already registered for this event"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error : "Event not found"});
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

// ADMIN : ajouter une réservation (registerDate est optionnel)
/**
 * @swagger
 *  components:
 *      responses:
 *          ParticipationInsertedAdmin:
 *              description : Participation created
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Participation created
 *                              participation:
 *                                  type: object
 *                                  properties:
 *                                      mail_address_user:
 *                                          type: string
 *                                      id_event:
 *                                          type: integer
 *                                      register_date:
 *                                          type: string
 *                                          format: date-time
 *      requestBodies:
 *          ParticipationaToAddAdmin:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idEvent:
 *                                  type: integer
 *                              mailAddress:
 *                                  type: string
 *                              registerDate:
 *                                  type: string
 *                                  format: date-time
 *                          required:
 *                              - idEvent
 *                              - mailAddress
 */
module.exports.insertParticipationAdmin = async (req, res) => {
    const client = await pool.connect();
    let {idEvent, mailAddress, registerDate} = req.body;
    try {
        if(!idEvent || !mailAddress){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([mailAddress, registerDate], [idEvent]);
        if(!mailAddress.match(Tools.mailAddressRegex)){
            throw new Error("Invalid mail address format");
        }
        if(registerDate){
            const registerDateConverted = new Date(registerDate);
            if(registerDateConverted == "Invalid Date"){
                throw new Error("Invalid Date");
            }
        }
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }
        const userExists = await UsersDB.userExists(client, mailAddress);
        if(!userExists){
            throw new Error("User not found");
        }

        const participationExists = await ParticipationDB.participationExists(client, mailAddress, idEvent);
        if(participationExists){
            throw new Error("Participation already registered");
        }

        // Par précaution : même si dans le modèle, la valeur par défaut est new Date()
        if(!registerDate){
            registerDate = new Date();
        }

        const {rows : participations} = await ParticipationDB.insertParticipation(client, mailAddress, idEvent, registerDate);
        const participation = participations[0];
        res.status(201).json({message : "Participation created", participation : participation});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Invalid mail address format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error : "Event not found"});
        } else if(e.message === "User not found"){
            res.status(404).json({error : "User not found"});
        } else if(e.message === "Participation already registered") {
            res.status(400).json({error : "Participation already registered for this event"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else if(e.message === "Invalid Date"){
            res.status(400).json({error : "Invalid dates in the request"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}

// ADMIN : modifier une réservation (registerDate, newIdEvent, newMailAddress sont optionnels)
/**
 * @swagger
 *  components:
 *      responses:
 *          ParticipationUpdated:
 *              description : Participation updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Participation updated
 *                              participation:
 *                                  type: object
 *                                  properties:
 *                                      id_event:
 *                                          type: integer
 *                                      mail_address_user:
 *                                          type: string
 *                                      register_date:
 *                                          type: string
 *                                          format: date-time
 *          ParticipationAlreadyRegisteredForUser:
 *              description: "New user already register for the specified event"
 *      requestBodies:
 *          ParticipationToUpdate:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idEvent:
 *                                  type: integer
 *                              mailAddress:
 *                                  type: string
 *                              registerDate:
 *                                  type: string
 *                                  format: date-time
 *                              newIdEvent:
 *                                  type: integer
 *                              newMailAddress:
 *                                  type: string
 */
module.exports.updateParticipation = async (req, res) => {
    const client = await pool.connect();
    let {idEvent, mailAddress, registerDate, newIdEvent, newMailAddress} = req.body;
    try {
        if(!idEvent || !mailAddress){
            throw new Error("Invalid request body");
        }
        if(!registerDate && !newIdEvent && !newMailAddress){
            throw new Error("Nothing to update");
        }
        Tools.validationTypes([mailAddress, registerDate, newMailAddress],  [idEvent, newIdEvent]);
        if(!mailAddress.match(Tools.mailAddressRegex) || !newMailAddress.match(Tools.mailAddressRegex)){
            throw new Error("Invalid mail address format");
        }
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }
        const userExists = await UsersDB.userExists(client, mailAddress);
        if(!userExists){
            throw new Error("User not found");
        }
        const {rows : participations} = await ParticipationDB.getParticipation(client, mailAddress, idEvent);
        const participation = participations[0];
        if(!participation) {
            throw new Error("Participation not found")
        }

        newMailAddress = newMailAddress ?? participation.mail_address_user;
        newIdEvent = newIdEvent ?? participation.id_event;
        registerDate = registerDate ?? participation.register_date;

        const registerDateConverted = new Date(registerDate);
        if(registerDateConverted == "Invalid Date"){
            throw new Error("Invalid Date");
        }

        const eventExist = await EventDB.eventExists(client, newIdEvent);
        if(!eventExist){
            throw new Error("Event not found");
        }
        const userExist = await UsersDB.userExists(client, newMailAddress);
        if(!userExist){
            throw new Error("User not found");
        }
        const {rows :participationAlreadyExists} = await ParticipationDB.getParticipation(client, newMailAddress, newIdEvent);
        if(participationAlreadyExists[0]){
            throw new Error("New user already register for the specified event");
        }
        const {rows : updatedParticipations} = await ParticipationDB.updateParticipation(client, mailAddress, idEvent, registerDate, newMailAddress, newIdEvent);
        const updatedParticipation = updatedParticipations[0];
        res.status(200).json({message : "Participation updated", participation : updatedParticipation});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Nothing to update"){
            res.status(400).json({error : "No updatable attribute"});
        } else if(e.message === "Invalid mail address format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error : "Event not found"});
        } else if(e.message === "User not found"){
            res.status(404).json({error : "User not found"});
        } else if(e.message === "Participation not found"){
            res.status(404).json({error : "Participation not found : this user is not registered for this event"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else if(e.message === "New user already register for the specified event"){
            res.status(400).json({error : "New user already register for the specified event"});
        } else if(e.message === "Invalid Date"){
            res.status(400).json({error : "Invalid dates in the request"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}

// Un utilisateur loggé peut supprimer ses réservations
/**
 * @swagger
 *  components:
 *      responses:
 *          DeleteParticipation:
 *              description : Participation deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Participation deleted
 *      requestBodies:
 *          DeleteParticipation:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idEvent:
 *                                  type: integer
 */
module.exports.deleteParticipation = async (req, res) => {
    const client = await pool.connect();
    const mailAddress = req.user.mailAddress;
    const {idEvent} = req.body;
    try {
        if(!idEvent){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([], [idEvent]);
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }
        const participationExists = await ParticipationDB.participationExists(client, mailAddress, idEvent);
        if(!participationExists){
            throw new Error("Participation not found");
        }
        await ParticipationDB.deleteParticipation(client, mailAddress, idEvent);
        res.status(200).json({message : "Participation deleted"});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error : "Event not found"});
        } else if(e.message === "Participation not found"){
            res.status(404).json({error : "Participation not found : this user is not registered for this event"});
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

// ADMIN : supprimer une réservation
/**
 * @swagger
 *  components:
 *      responses:
 *          DeleteParticipationAdmin:
 *              description : Participation deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Participation deleted
 *      requestBodies:
 *          DeleteParticipationAdmin:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idEvent:
 *                                  type: integer
 *                              mailAddress:
 *                                  type: string
 */
module.exports.deleteParticipationAdmin = async (req, res) => {
    const client = await pool.connect();
    const {idEvent, mailAddress} = req.body;
    try {
        if(!idEvent || !mailAddress){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([mailAddress], [idEvent]);
        if(!mailAddress.match(Tools.mailAddressRegex)){
            throw new Error("Invalid mail address format");
        }
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }
        const userExists = await UsersDB.userExists(client, mailAddress);
        if(!userExists){
            throw new Error("User not found");
        }
        const participationExists = await ParticipationDB.participationExists(client, mailAddress, idEvent);
        if(!participationExists){
            throw new Error("Participation not found");
        }
        await ParticipationDB.deleteParticipation(client, mailAddress, idEvent);
        res.status(200).json({message : "Participation deleted"});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Invalid mail address format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error : "Event not found"});
        } else if(e.message === "User not found"){
            res.status(404).json({error : "User not found"});
        } else if(e.message === "Participation not found"){
            res.status(404).json({error : "Participation not found : this user is not registered for this event"});
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

// ADMIN : Supprime toutes les participations d'un utilisateur
/**
 * @swagger
 *  components:
 *      responses:
 *          DeleteParticipationUserAdmin:
 *              description : "All user participations deleted"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: "All user participations deleted"
 *      requestBodies:
 *          DeleteParticipationUserAdmin:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              mailAddressUser:
 *                                  type: string
 */
module.exports.deleteAllParticipationsUser = async (req, res) => {
    const client = await pool.connect();
    const {mailAddressUser} = req.body;
    try {
        if(!mailAddressUser){
            throw new Error("Invalid request body");
        }
        if(!mailAddressUser.match(Tools.mailAddressRegex)){
            throw new Error("Invalid mail address format");
        }
        Tools.validationTypes([mailAddressUser]);
        const userExists = await UsersDB.userExists(client, mailAddressUser);
        if(!userExists){
            throw new Error("User not found");
        }
        await ParticipationDB.deleteAllParticipationsUser(client, mailAddressUser);
        res.status(200).json({message : "All user participations deleted"});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
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

// ADMIN : Supprime toutes les participations d'un événement
/**
 * @swagger
 *  components:
 *      responses:
 *          DeleteAllParticipationsEvent:
 *              description : "All event participations deleted"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: "All event participations deleted"
 *      requestBodies:
 *          DeleteAllParticipationsEvent:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idEvent:
 *                                  type: integer
 */
module.exports.deleteAllParticipationsEvent = async (req, res) => {
    const client = await pool.connect();
    const {idEvent} = req.body;
    try {
        if(!idEvent){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([], [idEvent]);
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }
        await ParticipationDB.deleteAllParticipationsEvent(client, idEvent);
        res.status(200).json({message : "All event participations deleted"});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error : "Event not found"});
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