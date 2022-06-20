const Router = require("express-promise-router");
const Identification = require("../../middleware/identification");
const AuthorizationAdmin = require("../../middleware/adminAuthorization");
const ParticipationController = require("../../controleur/participationDB");
const router = new Router;

// Partie gestion des participations coté utilisateur
/**
 * @swagger
 * /user/reservation/all:
 *  get:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetAllParticipations'
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
 router.get('/all', Identification.identification,AuthorizationAdmin.adminAuthorization, ParticipationController.getAllParticipations);

/**
 * @swagger
 * /user/reservation/consult:
 *  get:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/GetEventId'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetParticipationUser'
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
 *              description: Not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/EventNotFound'
 *                              - $ref: '#/components/responses/ParticipationNotFound'
 *          500:
 *              description: Server error
 *
 */
router.get('/consult', Identification.identification, ParticipationController.getParticipationUser);
/**
 * @swagger
 * /user/reservation/consult/all:
 *  get:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetAllEventsParticipationUser'
 *          400:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
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
router.get('/consult/all', Identification.identification, ParticipationController.getAllEventsParticipationUser);

 /**
 * @swagger
 * /user/reservation/consult/between:
 *  get:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - $ref: '#/components/parameters/GetStartingDate'
 *          - $ref: '#/components/parameters/GetEndingDate'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/GetParticipationsBetween'
 *          400:
 *              description: Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/ErrorJWT'
 *                              - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                              - $ref: '#/components/responses/InvalidRequestParameters'
 *                              - $ref: '#/components/responses/IncoherentDates'
 *
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
router.get('/consult/between', Identification.identification, ParticipationController.getParticipationsUserBetween);

/**
 * @swagger
 * /user/reservation/add:
 *  post:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/ParticipationToAdd'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/ParticipationInserted'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/InvalidRequestBody'
 *                               - $ref: '#/components/responses/ParticipationAlreadyRegistered'
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
 *          404:
 *              $ref: '#/components/responses/EventNotFound'
 *          500:
 *              description: Server error
 *
 */
router.post('/add', Identification.identification, ParticipationController.insertParticipation);
/**
 * @swagger
 * /user/reservation/admin/add:
 *  post:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/ParticipationaToAddAdmin'
 *      responses:
 *          201:
 *              $ref: '#/components/responses/ParticipationInsertedAdmin'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidMailAddressFormat'
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/InvalidRequestBody'
 *                               - $ref: '#/components/responses/ParticipationAlreadyRegistered'
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
 *                              - $ref: '#/components/responses/UserNotFound'
 *                              - $ref: '#/components/responses/EventNotFound'
 *          500:
 *              description: Server error
 *
 */
router.post('/admin/add', Identification.identification, AuthorizationAdmin.adminAuthorization, ParticipationController.insertParticipationAdmin);
/**
 * @swagger
 * /user/reservation/update:
 *  patch:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/ParticipationToUpdate'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/ParticipationUpdated'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidMailAddressFormat'
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/InvalidRequestBody'
 *                               - $ref: '#/components/responses/ParticipationAlreadyRegisteredForUser'
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
 *                              - $ref: '#/components/responses/UserNotFound'
 *                              - $ref: '#/components/responses/EventNotFound'
 *                              - $ref: '#/components/responses/ParticipationNotFound'
 *          500:
 *              description: Server error
 *
 */
router.patch('/update', Identification.identification, AuthorizationAdmin.adminAuthorization, ParticipationController.updateParticipation);
/**
 * @swagger
 * /user/reservation/delete:
 *  delete:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/DeleteParticipation'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/DeleteParticipation'
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
 *          404:
 *              description: Not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/EventNotFound'
 *                              - $ref: '#/components/responses/ParticipationNotFound'
 *          500:
 *              description: Server error
 *
 */
router.delete('/delete', Identification.identification, ParticipationController.deleteParticipation);
/**
 * @swagger
 * /user/reservation/admin/delete:
 *  delete:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/DeleteParticipationAdmin'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/DeleteParticipationAdmin'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/InvalidMailAddressFormat'
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
 *              description: Not found
 *              content:
 *                  application/json:
 *                      schema:
 *                          oneOf:
 *                              - $ref: '#/components/responses/UserNotFound'
 *                              - $ref: '#/components/responses/EventNotFound'
 *                              - $ref: '#/components/responses/ParticipationNotFound'
 *          500:
 *              description: Server error
 *
 */
router.delete('/admin/delete', Identification.identification, AuthorizationAdmin.adminAuthorization, ParticipationController.deleteParticipationAdmin);

/**
 * @swagger
 * /user/reservation/delete/all:
 *  delete:
 *      tags:
 *          - Participation
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          $ref: '#/components/requestBodies/DeleteParticipationUserAdmin'
 *      responses:
 *          200:
 *              $ref: '#/components/responses/DeleteParticipationUserAdmin'
 *          400:
 *              description : Error user
 *              content:
 *                  application/json:
 *                      schema:
 *                           oneOf:
 *                               - $ref: '#/components/responses/InvalidTypesInTheRequest'
 *                               - $ref: '#/components/responses/InvalidMailAddressFormat'
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
 *              $ref: '#/components/responses/UserNotFound'
 *          500:
 *              description: Server error
 *
 */
router.delete('/delete/all', Identification.identification, AuthorizationAdmin.adminAuthorization, ParticipationController.deleteAllParticipationsUser);

module.exports = router;