const StandRouter = require('./stand');
const EventController = require('../..//controleur/eventDB');
const Identification = require("../../middleware/identification");
const AdminAuthorization = require("../../middleware/adminAuthorization");

const Router = require("express-promise-router");
const ParticipationController = require("../../controleur/participationDB");
const router = new Router;

router.use("/stand", StandRouter);

// ----------------------------------------Partie gestion des événements----------------------------------------

/**
 * @swagger
 * /event/:
 *  get:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/GetEventId'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetEvent'
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
router.get('/', Identification.identification, EventController.getEvent);

/**
 * @swagger
 * /event/all:
 *  get:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetAllEvents'
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
router.get('/all', Identification.identification, EventController.getAllEvents);

/**
 * @swagger
 * /event/search:
 *  get:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/SearchEventsDate'
 *          - $ref: '#/components/parameters/SearchEventsCity'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/SearchEvents'
 *          400:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
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
 *          500:
 *              description: Server error
 *
 */
router.get('/search', Identification.identification, EventController.searchEvent);

/**
 * @swagger
 * /event/popular:
 *  get:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/MostPopularEvents'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/MostPopularEvents'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidNumber'
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
router.get('/popular', Identification.identification, EventController.getMostPopularEvents);

/**
 * @swagger
 * /event/add:
 *  post:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/EventToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/EventInserted'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
*                           oneOf:
*                               - $ref: '#/components/responses/InvalidMailAddressFormat'
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
 *              $ref: '#/components/responses/CreatorNotFound'
 *          500:
 *              description: Server error
 *
 */
router.post('/add', Identification.identification, AdminAuthorization.adminAuthorization, EventController.insertEvent);

/**
 * @swagger
 * /event/update:
 *  patch:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/EventToUpdate'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/EventUpdated'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidMailAddressFormat'
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
 *              description: Not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/CreatorNotFound'
 *                              - $ref: '#/components/responses/EventNotFound'
 *          500:
 *              description: Server error
 *
 */
router.patch('/update', Identification.identification, AdminAuthorization.adminAuthorization, EventController.updateEvent);

/**
 * @swagger
 * /event/delete:
 *  delete:
 *      tags:
 *          - Event
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/DeleteEvent'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/DeleteEvent'
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
router.delete('/delete', Identification.identification, AdminAuthorization.adminAuthorization, EventController.deleteEvent);


// ----------------------------------------Partie gestion des participations coté événement----------------------------------------
/**
 * @swagger
 * /event/reservation/:
 *  get:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/GetEventId'
 *          - $ref: '#/components/parameters/GetMailAddress'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetParticipation'
 *          400:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/InvalidMailAddressFormat'
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
 *          403:
 *              $ref: '#/components/responses/adminAuthorization'
 *          404:
 *              description: Not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/EventNotFound'
 *                              - $ref: '#/components/responses/UserNotFound'
 *                              - $ref: '#/components/responses/ParticipationNotFound'
 *          500:
 *              description: Server error
 *
 */
router.get('/reservation/', Identification.identification, AdminAuthorization.adminAuthorization, ParticipationController.getParticipation);

/**
 * @swagger
 * /event/reservation/count:
 *  get:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/GetEventId'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetParticipationsCountEvent'
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
router.get('/reservation/count', Identification.identification, ParticipationController.getParticipationsCountEvent);

/**
 * @swagger
 * /event/reservation/consult/all:
 *  get:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/GetEventId'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetAllParticipationsEvent'
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
 *          403:
 *              $ref: '#/components/responses/adminAuthorization'
 *          404:
 *              $ref: '#/components/responses/EventNotFound'
 *          500:
 *              description: Server error
 *
 */
router.get('/reservation/consult/all', Identification.identification, AdminAuthorization.adminAuthorization, ParticipationController.getAllParticipationsEvent);

/**
 * @swagger
 * /event/reservation/delete/all:
 *  delete:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/DeleteAllParticipationsEvent'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/DeleteAllParticipationsEvent'
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
router.delete('/reservation/delete/all', Identification.identification, AdminAuthorization.adminAuthorization, ParticipationController.deleteAllParticipationsEvent);

module.exports = router;
