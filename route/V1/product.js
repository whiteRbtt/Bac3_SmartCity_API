const ProductController = require("../../controleur/productDB");
const Identification = require("../../middleware/identification");
const AdminAuthorization = require("../../middleware/adminAuthorization");

const Router = require("express-promise-router");
const router = new Router;

/**
 * @swagger
 * /product/get:
 *  get:
 *      tags:
 *          - Product
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/GetProductId'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetProduct'
 *          400:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                              - $ref: '#/components/responses/InvalidRequestParameters'
 *          401:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/MissingJWT'
 *                              - $ref: '#/components/responses/ExpiredJWT'
 *                              - $ref: '#/components/responses/UnvalidedJWT'
 *          404:
 *              $ref: '#/components/responses/ProductNotFound'
 *          500:
 *              description: Server error
 *
 */
router.get("/get", Identification.identification, ProductController.getProduct);

/**
 * @swagger
 * /product/all:
 *  get:
 *      tags:
 *          - Product
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetAllProducts'
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
router.get('/all', Identification.identification, ProductController.getAllProducts);

/**
 * @swagger
 * /product/add:
 *  post:
 *      tags:
 *          - Product
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/ProductToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/ProductInserted'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/InvalidRequestBody'
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
 *          500:
 *              description: Server error
 *
 */
router.post("/add", Identification.identification, AdminAuthorization.adminAuthorization, ProductController.insertProduct);
/**
 * @swagger
 * /product/update:
 *  patch:
 *      tags:
 *          - Product
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/ProductToUpdate'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/ProductUpdated'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/InvalidRequestBody'
 *                               - $ref: '#/components/responses/ErrorJWT'
 *                               - $ref: '#/components/responses/NothingToUpdate'
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
 *              $ref: '#/components/responses/ProductNotFound'
 *          500:
 *              description: Server error
 *
 */
router.patch("/update", Identification.identification, AdminAuthorization.adminAuthorization, ProductController.updateProduct);
/**
 * @swagger
 * /product/delete:
 *  delete:
 *      tags:
 *          - Product
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/DeleteProduct'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/DeleteProduct'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/InvalidRequestBody'
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
 *              $ref: '#/components/responses/ProductNotFound'
 *          500:
 *              description: Server error
 *
 */
router.delete("/delete", Identification.identification, AdminAuthorization.adminAuthorization, ProductController.deleteProduct);

module.exports = router;