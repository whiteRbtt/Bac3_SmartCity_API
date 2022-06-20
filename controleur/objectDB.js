const pool = require('../modele/database');
const StandDB = require('../modele/standDB');
const ObjectDB = require('../modele/objectDB');
const ProductDB = require('../modele/productDB');
const Tools = require('../tools');

// Obtenir tous les objets vendus sur un stand
/**
 * @swagger
 *  components:
 *      responses:
 *          GetAllObjectsByStandId:
 *              description: Get all objects by stand id
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              products:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: integer
 *                                          name:
 *                                              type: string
 *                                          description:
 *                                              type: string
 *                                          price:
 *                                              type: number
 *      parameters:
 *          GetStandId:
 *              in: query
 *              name: idStand
 *              schema:
 *                  type: integer
 *              description: ID of the stand
 *              required: true
 */
module.exports.getAllObjectsByStandId = async (req, res) => {
    const client = await pool.connect();
    let {idStand} = req.query;
    try {
        if(!idStand){
            throw new Error("Invalid request parameters");
        }
        Tools.validationTypes([], [Number(idStand)]);
        const standExists = await StandDB.standExists(client, idStand);
        if(!standExists){
            throw new Error("Stand not found");
        }
        const {rows : products} = await StandDB.getAllProductsStand(client, idStand);
        res.status(200).json({products : products});
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

// Obtenir toutes les relations produit-stand
/**
 * @swagger
 *  components:
 *      responses:
 *          GetAllObjects:
 *              description: Get every single stand-product relations within db
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              products:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          standType:
 *                                              type: string
 *                                          standId:
 *                                              type: integer
 *                                          productName:
 *                                              type: string
 *                                          productId:
 *                                              type: integer
 */
module.exports.getAllObjects = async (req, res) => {
    const client = await pool.connect();
    try {
        const { rows: objects } = await ObjectDB.getAllObjects(client);
        res.status(200).json({ objects: objects });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
};

// ADMIN : insérer un objet à vendre un stand
/**
 * @swagger
 *  components:
 *      responses:
 *          ObjectInserted:
 *              description : Object inserted for the stand
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Object inserted for the stand
 *          ObjectAlreadyRegistered:
 *              description: "Object already registered for this stand"
 *      requestBodies:
 *          ObjectToAdd:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idProduct:
 *                                  type: integer
 *                              idStand:
 *                                  type: integer
 *                          required:
 *                              - idStand
 *                              - idProduct
 */
module.exports.insertObject = async (req, res) => {
    const client = await pool.connect();
    const {idStand, idProduct} = req.body;
    try {
        if(!idStand || !idProduct){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([], [idStand, idProduct]);
        const standExists = await StandDB.standExists(client, idStand);
        if(!standExists){
            throw new Error("Stand not found");
        }
        const productExists = await ProductDB.productExists(client, idProduct);
        if(!productExists){
            throw new Error("Product not found");
        }

        const objectsExists = await ObjectDB.objectExists(client, idStand, idProduct);
        if(objectsExists){
            throw new Error("Object already registered for this stand");
        }
        await ObjectDB.insertObject(client, idStand, idProduct);
        res.status(201).json({message : "Object inserted for the stand"});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Stand not found"){
            res.status(404).json({error : "Stand not found"});
        } else if(e.message === "Product not found"){
            res.status(404).json({error : "Product not found"});
        } else if(e.message === "Object already registered for this stand"){
            res.status(400).json({error : "Object already registered for this stand"});
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

// ADMIN : mettre à jour un objet vendu sur un stand
/**
 * @swagger
 *  components:
 *      responses:
 *          ObjectUpdated:
 *              description : "Object updated from the stand"
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: "Object updated from the stand"
 *          ObjectNotFound:
 *              description: "Object not found"
 *          ObjectAlreadyRegistered:
 *              description: "Object already registered"
 *      requestBodies:
 *          ObjectToUpdate:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idStand:
 *                                  type: integer
 *                              idProduct:
 *                                  type: integer
 *                              newIdStand:
 *                                  type: integer
 *                              newIdProduct:
 *                                  type: integer
 */
module.exports.updateObject = async (req, res) => {
    const client = await pool.connect();
    let {idStand, idProduct, newIdStand, newIdProduct} = req.body;
    try {
        if(!idStand || !idProduct){
            throw new Error("Invalid request body");
        }
        if(!newIdStand && !newIdProduct){
            throw new Error("Nothing to update");
        }
        Tools.validationTypes([], [idStand, idProduct, newIdStand, newIdProduct]);
        const {rows : objects} = await ObjectDB.getObject(client, idStand, idProduct);
        const object = objects[0];
        if(!object){
            throw new Error("Object not found");
        }

        newIdStand = newIdStand ?? object.id_stand;
        newIdProduct = newIdProduct ?? object.id_product;

        const standExists = await StandDB.standExists(client, newIdStand);
        if(!standExists){
            throw new Error("Stand not found");
        }
        const productExists = await ProductDB.productExists(client, newIdProduct);
        if(!productExists){
            throw new Error("Product not found");
        }

        const objectsExists = await ObjectDB.objectExists(client, newIdStand, newIdProduct);
        if(objectsExists){
            throw new Error("Object already registered");
        }
        await ObjectDB.updateObject(client, idStand, idProduct, newIdStand, newIdProduct);
        res.status(200).json({message : "Object updated from the stand"});
    } catch(e) {
        if(e.message === "Nothing to update"){
            res.status(400).json({error : "No updatable attribute"});
        } else if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Object not found"){
            res.status(404).json({error : "Object not found"});
        } else if(e.message === "Stand not found"){
            res.status(404).json({error : "Stand not found"});
        } else if(e.message === "Product not found"){
            res.status(404).json({error : "Product not found"});
        } else if(e.message === "Object already registered"){
            res.status(400).json({error : "Object already registered"});
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

// ADMIN : supprimer un objet vendu sur un stand
/**
 * @swagger
 *  components:
 *      responses:
 *          DeleteObject:
 *              description: Object deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: "Object deleted from the stand"
 *      requestBodies:
 *          DeleteObject:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idStand:
 *                                  type: integer
 *                              idProduct:
 *                                  type: integer
 */
module.exports.deleteObject = async (req, res) => {
    const client = await pool.connect();
    const {idStand, idProduct} = req.body;
    try {
        if(!idStand || !idProduct){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([], [idStand, idProduct]);
        const objectsExists = await ObjectDB.objectExists(client, idStand, idProduct);
        if(!objectsExists){
            throw new Error("Object not found");
        }

        await ObjectDB.deleteObject(client, idStand, idProduct);
        res.status(200).json({error : "Object deleted from the stand"});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Object not found"){
            res.status(404).json({error : "Object not found"});
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