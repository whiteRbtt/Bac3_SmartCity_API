const pool = require('../modele/database');
const EventDB = require('../modele/eventDB');
const StandDB = require('../modele/standDB');
const ObjectDB = require('../modele/objectDB');
const Tools = require('../tools');

// Obtenir les infos concernant un stand
/**
 * @swagger
 *  components:
 *      responses:
 *          GetStand:
 *              description: Get a Stand
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              stand:
 *                                  type: object
 *                                  properties:
 *                                      type:
 *                                          type: string
 *                                      manager_name:
 *                                          type: string
 *                                      area_size:
 *                                          type: integer
 *                                      id_event:
 *                                          type: integer
 *          StandNotFound:
 *              description: "Stand not found"
 *      parameters:
 *          GetStandId:
 *              in: query
 *              name: idStand
 *              schema:
 *                  type: integer
 *              description: ID of the stand
 *              required: true
 */
module.exports.getStand = async (req, res) => {
    const client = await pool.connect();
    let {idStand} = req.query;
    try {
        if(!idStand){
            throw new Error("Invalid request parameters");
        }
        Tools.validationTypes([], [Number(idStand)]);
        const {rows : stands} = await StandDB.getStand(client, idStand);
        const stand = stands[0];
        if(!stand){
            throw new Error("Stand not found");
        }
        res.status(200).json({stand : stand});
    } catch(e) {
        if(e.message === "Invalid request parameters"){
            res.status(400).json({error : "Invalid request parameters, please consult the documentation"});
        } else if(e.message === "Stand not found"){
            res.status(404).json({error : "Stand not found"});
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

// Obtenir tous les stands
/**
 * @swagger
 *  components:
 *      responses:
 *          getAllStands:
 *              description: Get every single stands within db
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              stand:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                          type:
 *                                              type: string
 *                                          manager_name:
 *                                              type: string
 *                                          area_size:
 *                                              type: integer
 *                                          id_event:
 *                                              type: integer
 */
module.exports.getAllStands = async (req, res) => {
    const client = await pool.connect();
    try {
        const { rows: stands } = await StandDB.getAllStands(client);
        res.status(200).json({ stands: stands });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
};
// Obtenir les infos sur tous les stands présents à un événement
/**
 * @swagger
 *  components:
 *      responses:
 *          GetStandEvent:
 *              description: Get all stands event
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              stands:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                          type:
 *                                              type: string
 *                                          manager_name:
 *                                              type: string
 *                                          area_size:
 *                                              type: integer
 *      parameters:
 *          GetStandEvent:
 *              in: query
 *              name: idEvent
 *              schema:
 *                  type: integer
 *              description: ID of the event
 *              required: true
 */
module.exports.getAllStandsEvent = async (req, res) => {
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
        const {rows : stands} = await StandDB.getAllStandsEvent(client, idEvent);
        res.status(200).json({stands : stands});
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

// ADMIN : ajouter un stand à un événement
/**
 * @swagger
 *  components:
 *      responses:
 *          StandInserted:
 *              description : Stand created
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Stand created
 *                              stand:
 *                                  type: object
 *                                  properties:
 *                                      id:
 *                                          type: integer
 *                                      type:
 *                                          type: string
 *                                      manager_name:
 *                                          type: string
 *                                      area_size:
 *                                          type: integer
 *                                      id_event:
 *                                          type: integer
 *      requestBodies:
 *          StandToAdd:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              type:
 *                                  type: string
 *                              managerName:
 *                                  type: string
 *                              areaSize:
 *                                  type: integer
 *                              idEvent:
 *                                  type: integer
 *                          required:
 *                              - type
 *                              - managerName
 *                              - areaSize
 *                              - idEvent
 */
module.exports.insertStand = async (req, res) => {
    const client = await pool.connect();
    const {type, managerName, areaSize, idEvent} = req.body;
    try {
        // areaSize > 0
        if(!type || !managerName || !areaSize || !idEvent || areaSize < 0){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([type, managerName], [areaSize, idEvent]);
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }
        const {rows : stands} = await StandDB.insertStand(client, type, managerName, areaSize, idEvent);
        const stand = stands[0];
        res.status(201).json({message : "Stand created", stand : stand});
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

// ADMIN : mettre à jour un stand (type, managerName, areaSize et idEvent sont optionnels)
/**
 * @swagger
 *  components:
 *      responses:
 *          StandUpdated:
 *              description : Stand updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Stand updated
 *                              stand:
 *                                  type: object
 *                                  properties:
 *                                      id:
 *                                          type: integer
 *                                      type:
 *                                          type: string
 *                                      manager_name:
 *                                          type: string
 *                                      area_size:
 *                                          type: integer
 *                                      id_event:
 *                                          type: integer
 *      requestBodies:
 *          StandToUpdate:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idStand:
 *                                  type: integer
 *                              type:
 *                                  type: string
 *                              managerName:
 *                                  type: string
 *                              areaSize:
 *                                  type: integer
 *                              idEvent:
 *                                  type: integer
 */
module.exports.updateStand = async (req, res) => {
    const client = await pool.connect();
    let {idStand, type, managerName, areaSize, idEvent} = req.body;
    try {
        Tools.validationTypes([type, managerName], [areaSize, idEvent]);
        if(!idStand){
            throw new Error("Invalid request body");
        }
        if(!type && !managerName && !areaSize && !idEvent){
            throw new Error("Nothing to update");
        }
        if(areaSize <= 0){
            throw new Error("Invalid request body");
        }
        if(idEvent){
            const eventExists = await EventDB.eventExists(client, idEvent);
            if(!eventExists){
                throw new Error("Event not found");
            }
        }
        const {rows : stands} = await StandDB.getStand(client, idStand);
        const stand = stands[0];
        if(!stand){
            throw new Error("Stand not found");
        }

        type = type ?? stand.type;
        managerName = managerName ?? stand.manager_name;
        areaSize = areaSize ?? stand.area_size;
        idEvent = idEvent ?? stand.id_event;
        const {rows : updatedStands} = await StandDB.updateStand(client, idStand, type, managerName, areaSize, idEvent);
        const updatedStand = updatedStands[0];
        res.status(200).json({message : "Stand updated", stand : updatedStand});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Nothing to update"){
            res.status(400).json({error : "No updatable attribute"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error : "Event not found"});
        } else if(e.message === "Stand not found"){
            res.status(404).json({error : "Stand not found"});
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

// ADMIN : supprimer un stand
/**
 * @swagger
 *  components:
 *      responses:
 *          DeleteStand:
 *              description: Stand deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Stand deleted
 *      requestBodies:
 *          DeleteStand:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idStand:
 *                                  type: integer
 */
module.exports.deleteStand = async (req, res) => {
    const client = await pool.connect();
    const {idStand} = req.body;
    try {
        if(!idStand){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([], [idStand]);
        await client.query("BEGIN;");
        const standExists = await StandDB.standExists(client, idStand);
        if(!standExists){
            throw new Error("Stand not found");
        }

        await ObjectDB.deleteObjectsStand(client, idStand);
        await StandDB.deleteStand(client, idStand);
        await client.query("COMMIT;");
        res.status(200).json({message : "Stand deleted"});
    } catch(e) {
        await client.query("ROLLBACK;");
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Stand not found"){
            res.status(404).json({error : "Stand not found"});
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

// La précondition n'impose pas d'avoir au moins 1 stand pour cet évent pour utiliser cette méthode
/**
 * @swagger
 *  components:
 *      responses:
 *          DeleteAllStands:
 *              description: All event stands deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: All event stands deleted
 *      requestBodies:
 *          DeleteAllStands:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idEvent:
 *                                  type: integer
 */
module.exports.deleteAllStandsEvent = async (req, res) => {
    const client = await pool.connect();
    const {idEvent} = req.body;
    try {
        if(!idEvent){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([], [idEvent]);
        await client.query("BEGIN;");
        const eventExists = await EventDB.eventExists(client, idEvent);
        if(!eventExists){
            throw new Error("Event not found");
        }
        const {rows : stands} = await StandDB.getAllStandsEvent(client, idEvent);
        for(const stand of stands){
            await ObjectDB.deleteObjectsStand(client, stand.id);
            await StandDB.deleteStand(client, stand.id);
        }
        await client.query("COMMIT;");
        res.status(200).json({message : "All event stands deleted"});
    } catch(e) {
        await client.query("ROLLBACK;");
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