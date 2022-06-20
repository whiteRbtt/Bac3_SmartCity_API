const ObjectRouter = require('./object');
const StandController = require("../../controleur/standDB");
const Identification = require("../../middleware/identification");
const AdminAuthorization = require("../../middleware/adminAuthorization");

const Router = require("express-promise-router");
const router = new Router;

router.use("/product", ObjectRouter);

// Partie gestion des stands
/**
 * @swagger
 * /event/stand/get:
 *  get:
 *      tags:
 *          - Stand
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/GetStandId'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetStand'
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
router.get('/get', Identification.identification, StandController.getStand);
/**
 * @swagger
 * /event/stand/all:
 *  get:
 *      tags:
 *          - Stand
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/getAllStands'
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
 router.get('/all', Identification.identification, AdminAuthorization.adminAuthorization, StandController.getAllStands);
/**
 * @swagger
 * /event/stand/get/all:
 *  get:
 *      tags:
 *          - Stand
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/GetStandEvent'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetStandEvent'
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
 *              $ref: '#/components/responses/EventNotFound'
 *          500:
 *              description: Server error
 *
 */
router.get('/get/all', Identification.identification, StandController.getAllStandsEvent);
/**
 * @swagger
 * /event/stand/add:
 *  post:
 *      tags:
 *          - Stand
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/StandToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/StandInserted'
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
 *              $ref: '#/components/responses/EventNotFound'
 *          500:
 *              description: Server error
 *
 */
router.post('/add', Identification.identification, AdminAuthorization.adminAuthorization, StandController.insertStand);
/**
 * @swagger
 * /event/stand/update:
 *  patch:
 *      tags:
 *          - Stand
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/StandToUpdate'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/StandUpdated'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/InvalidRequestBody'
 *                               - $ref: '#/components/responses/NothingToUpdate'
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
 *                              - $ref: '#/components/responses/EventNotFound'
 *          500:
 *              description: Server error
 *
 */
router.patch('/update', Identification.identification, AdminAuthorization.adminAuthorization, StandController.updateStand);
/**
 * @swagger
 * /event/stand/delete:
 *  delete:
 *      tags:
 *          - Stand
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/DeleteStand'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/DeleteStand'
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
 *              $ref: '#/components/responses/StandNotFound'
 *          500:
 *              description: Server error
 *
 */
router.delete('/delete', Identification.identification, AdminAuthorization.adminAuthorization, StandController.deleteStand);

/**
 * @swagger
 * /event/stand/delete/all:
 *  delete:
 *      tags:
 *          - Stand
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/DeleteAllStands'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/DeleteAllStands'
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
 *              $ref: '#/components/responses/EventNotFound'
 *          500:
 *              description: Server error
 *
 */
router.delete('/delete/all', Identification.identification, AdminAuthorization.adminAuthorization, StandController.deleteAllStandsEvent);

module.exports = router;