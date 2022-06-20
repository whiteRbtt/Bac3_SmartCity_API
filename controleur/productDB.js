const pool = require('../modele/database');
const ProductDB = require('../modele/productDB');
const ObjectDB = require('../modele/objectDB');
const Tools = require('../tools');

/**
 * @swagger
 *  components:
 *      responses:
 *          GetProduct:
 *              description: Product matching given id
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              product:
 *                                  type: object
 *                                  properties:
 *                                      name:
 *                                          type: string
 *                                      description:
 *                                          type: string
 *                                      price:
 *                                          type: number
 *          ProductNotFound:
 *              description: "Product not found"
 *      parameters:
 *          GetProductId:
 *              in: query
 *              name: idProduct
 *              schema:
 *                  type: integer
 *              description: ID of the product
 *              required: true
 */
module.exports.getProduct = async (req, res) => {
    const client = await pool.connect();
    let {idProduct} = req.query;
    try {
        if(!idProduct){
            throw new Error("Invalid request parameters");
        }
        Tools.validationTypes([], [Number(idProduct)]);
        const {rows : products} = await ProductDB.getProduct(client, idProduct);
        const product = products[0];
        if(!product){
            throw new Error("Product not found");
        }
        res.status(200).json({product : product});
    } catch(e) {
        if(e.message === "Invalid request parameters"){
            res.status(400).json({error : "Invalid request parameters, please consult the documentation"});
        } else if(e.message === "Product not found"){
            res.status(404).json({error : "Product not found"});
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

/**
 * @swagger
 *  components:
 *      responses:
 *          GetAllProducts:
 *              description: Every known products
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
 */
module.exports.getAllProducts = async (req, res) => {
    const client = await pool.connect();
    try {
        const {rows : products} = await ProductDB.getAllProducts(client);
        res.status(200).json({products : products});
    } catch(e) {
        console.error(e);
        res.status(500).json({error : "Server error"});
    } finally {
        client.release();
    }
}

// ADMIN
/**
 * @swagger
 *  components:
 *      responses:
 *          ProductInserted:
 *              description : Product successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Product created
 *                              product:
 *                                  type: object
 *                                  properties:
 *                                      id:
 *                                          type: integer
 *                                      name:
 *                                          type: string
 *                                      description:
 *                                          type: string
 *                                      price:
 *                                          type: number
 *      requestBodies:
 *          ProductToAdd:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              name:
 *                                  type: string
 *                              description:
 *                                  type: string
 *                              price:
 *                                  type: number
 *                          required:
 *                              - name
 *                              - description
 *                              - price
 */
module.exports.insertProduct = async (req, res) => {
    const client = await pool.connect();
    const {name, description, price} = req.body;
    try {
        // Prix > 0
        if(!name || !description || !price || price < 0){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([name, description], [price]);
        const {rows : products} = await ProductDB.insertProduct(client, name, description, price);
        const product = products[0];
        res.status(201).json({message : "Product created", product : product});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
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

// ADMIN
/**
 * @swagger
 *  components:
 *      responses:
 *          ProductUpdated:
 *              description : Product successfully updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Product updated
 *                              product:
 *                                  type: object
 *                                  properties:
 *                                      id:
 *                                          type: integer
 *                                      name:
 *                                          type: string
 *                                      description:
 *                                          type: string
 *                                      price:
 *                                          type: number
 *      requestBodies:
 *          ProductToUpdate:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idProduct:
 *                                  type: integer
 *                              name:
 *                                  type: string
 *                              description:
 *                                  type: string
 *                              price:
 *                                  type: number
 */
module.exports.updateProduct = async (req, res) => {
    const client = await pool.connect();
    let {idProduct, name, description, price} = req.body;
    try {
        // Prix > 0
        if(!name && !description && !price){
            throw new Error("Nothing to update");
        }
        if(!idProduct){
            throw new Error("Invalid request body");
        }
        if(price && price < 0){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([name, description], [idProduct, price]);
        const {rows : products} = await ProductDB.getProduct(client, idProduct);
        const product = products[0];
        if(!product){
            throw new Error("Product not found");
        }

        name = name ?? product.name;
        description = description ?? product.description;
        price = price ?? product.price;

        const {rows : updatedProducts} = await ProductDB.updateProduct(client, idProduct, name, description, price);
        const updatedProduct = updatedProducts[0];
        res.status(200).json({message : "Product updated", product : updatedProduct});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Nothing to update"){
            res.status(400).json({error : "No updatable attribute"});
        } else if(e.message === "Product not found"){
            res.status(404).json({error : "Product not found"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    }
}

// ADMIN
/**
 * @swagger
 *  components:
 *      responses:
 *          DeleteProduct:
 *              description: The product (and his relationship) has successfully been deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Product deleted
 *      requestBodies:
 *          DeleteProduct:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idProduct:
 *                                  type: integer
 */
module.exports.deleteProduct = async (req, res) => {
    const client = await pool.connect();
    const {idProduct} = req.body;
    try {
        if(!idProduct){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([], [idProduct]);
        await client.query("BEGIN;");
        const productExists = await ProductDB.productExists(client, idProduct);
        if(!productExists){
            throw new Error("Product not found");
        }

        await ObjectDB.deleteObjectsProduct(client, idProduct);
        await ProductDB.deleteProduct(client, idProduct);
        await client.query("COMMIT;");
        res.status(200).json({message : "Product deleted"});
    } catch(e) {
        await client.query("ROLLBACK;");
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else if(e.message === "Product not found"){
            res.status(404).json({error : "Product not found"});
        } else {
            console.error(e);
            res.status(500).json({error : "Server error"});
        }
    } finally {
        client.release();
    }
}