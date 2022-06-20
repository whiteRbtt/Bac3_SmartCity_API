const Router = require("express-promise-router");
const Identification = require("../../middleware/identification");
const AuthorizationAdmin = require("../../middleware/adminAuthorization");
const ObjectController = require("../../controleur/objectDB")
const router = new Router;

/**
 * @swagger
 * /event/stand/product/:
 *  get:
 *      tags:
 *          - Object
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/GetStandId'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetAllObjectsByStandId'
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
 *              $ref: '#/components/responses/StandNotFound'
 *          500:
 *              description: Server error
 *
 */
router.get('/', Identification.identification, ObjectController.getAllObjectsByStandId);
/**
 * @swagger
 * /event/stand/product/all:
 *  get:
 *      tags:
 *          - Object
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetAllObjects'
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
router.get('/all', Identification.identification,AuthorizationAdmin.adminAuthorization, ObjectController.getAllObjects);
/**
 * @swagger
 * /event/stand/product/add:
 *  post:
 *      tags:
 *          - Object
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/ObjectToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/ObjectInserted'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/InvalidRequestBody'
 *                               - $ref: '#/components/responses/ObjectAlreadyRegistered'
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
 *              description: Not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/StandNotFound'
 *                              - $ref: '#/components/responses/ProductNotFound'
 *          500:
 *              description: Server error
 *
 */
router.post('/add', Identification.identification, AuthorizationAdmin.adminAuthorization, ObjectController.insertObject);
/**
 * @swagger
 * /event/stand/product/update:
 *  patch:
 *      tags:
 *          - Object
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/ObjectToUpdate'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/ObjectUpdated'
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
 *                               - $ref: '#/components/responses/ObjectAlreadyRegistered'
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
 *              description: Not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ObjectNotFound'
 *                              - $ref: '#/components/responses/StandNotFound'
 *                              - $ref: '#/components/responses/ProductNotFound'
 *          500:
 *              description: Server error
 *
 */
router.patch('/update', Identification.identification, AuthorizationAdmin.adminAuthorization, ObjectController.updateObject);
/**
 * @swagger
 * /event/stand/product/delete:
 *  delete:
 *      tags:
 *          - Object
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/DeleteObject'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/DeleteObject'
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
 *              $ref: '#/components/responses/ObjectNotFound'
 *          500:
 *              description: Server error
 *
 */
router.delete('/delete', Identification.identification, AuthorizationAdmin.adminAuthorization, ObjectController.deleteObject);

module.exports = router;