const pool = require('../modele/database');
const EventDB = require('../modele/eventDB');
const ParticipationDB = require('../modele/participationDB');
const StandDB = require('../modele/standDB');
const UserDB = require('../modele/userDB');
const ObjectDB = require('../modele/objectDB');
const Tools = require('../tools');

/**
 * @swagger
 *  components:
 *      responses:
 *          GetEvent:
 *              description: Event matching given id
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              id:
 *                                  type: integer
 *                              name:
 *                                  type: string
 *                              starting_date:
 *                                  type: string
 *                                  format: date-time
 *                              ending_date:
 *                                  type: string
 *                                  format: date-time
 *                              street_name:
 *                                  type: string
 *                              postal_code:
 *                                  type: integer
 *                              city:
 *                                  type: string
 *                              children_accepted:
 *                                  type: boolean
 *                              description:
 *                                  type: string
 *                              security_level:
 *                                  type: integer
 *                              require_mask:
 *                                  type: boolean
 *                              require_covid_safe_ticket:
 *                                  type: boolean
 *                              max_place_count:
 *                                  type: integer
 *                              mail_address_creator:
 *                                  type: string
 *                              count:
 *                                  type: integer
 *                              stand_count:
 *                                  type: integer
 *          EventNotFound:
 *              description: "Event not found"
 *      parameters:
 *          GetEventId:
 *              in: query
 *              name: idEvent
 *              schema:
 *                  type: integer
 *              description: ID of the event
 *              required: true
 */
module.exports.getEvent = async (req, res) => {
    const client = await pool.connect();
    let {idEvent} = req.query;
    try {
        if(!idEvent){
            throw new Error("Invalid request parameters");
        }
        Tools.validationTypes([], [Number(idEvent)]);
        const {rows : events} = await EventDB.getEvent(client, idEvent);
        const event = events[0];
        if(!event){
            throw new Error("Event not found");
        }

        const {rows : participations} = await ParticipationDB.getParticipationCountEvent(client, idEvent);
        event["count"] = parseInt(participations[0].participation_count);
        const {rowCount : standCount} = await StandDB.getAllStandsEvent(client, idEvent);
        event["stand_count"] = standCount;
        res.status(200).json({event : event});
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

/**
 * @swagger
 *  components:
 *      responses:
 *          GetAllEvents:
 *              description: Every known events
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              events:
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
module.exports.getAllEvents = async (req, res) => {
    const client = await pool.connect();
    try {
        const {rows : events} = await EventDB.getAllEvents(client);
        const modifiedEvents = [];
        for(const event of events){
            const idEvent = event.id;
            const {rows : participations} = await ParticipationDB.getParticipationCountEvent(client, idEvent);
            const participation = participations[0];
            event["count"] = parseInt(participation.participation_count);

            const {rowCount : standCount} = await StandDB.getAllStandsEvent(client, idEvent);
            event["stand_count"] = standCount;

            modifiedEvents.push(event);
        }
        res.status(200).json({events : modifiedEvents});
    } catch(e) {
        console.error(e);
        res.status(500).json({error : "Server error"});
    } finally {
        client.release();
    }
}

/**
 * @swagger
 *  components:
 *      responses:
 *          SearchEvents:
 *              description: Every events matching given city and/or date
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              events:
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
 *      parameters:
 *          SearchEventsDate:
 *              in: query
 *              name: date
 *              schema:
 *                  type: string
 *                  format: date-time
 *              description: Date of the event
 *          SearchEventsCity:
 *              in: query
 *              name: city
 *              schema:
 *                  type: string
 *              description: City of the event
 */
module.exports.searchEvent = async (req, res) => {
    const client = await pool.connect();
    const {date, city} = req.query;
    try {
        // Si aucune date n'est reçue : on affiche les événements futurs
        if(!date){
            const {rows : events} = await EventDB.searchUpcomingEvents(client, city);
            return res.status(200).json({events : events});
        }
        const convertedDate = new Date(date);
        if(convertedDate == "Invalid Date"){
            throw new Error("Invalid Date");
        }
        const {rows : events} = await EventDB.searchEvents(client, date, city);
        res.status(200).json({events : events});
    } catch(e) {
        if(e.message === "Invalid Date"){
            res.status(400).json({error : "Invalid dates in the request"});
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
 *          MostPopularEvents:
 *              description: Most popular events
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              events:
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
 *          InvalidNumber:
 *              description: "Invalid number"
 *      parameters:
 *          MostPopularEvents:
 *              in: query
 *              name: topNumber
 *              schema:
 *                  type: integer
 *              description: The number of most popular events needed
 */
module.exports.getMostPopularEvents = async (req, res) => {
    const client = await pool.connect();
    let {topNumber = 5} = req.query;
    try {
        Tools.validationTypes([], [Number(topNumber)]);
        if(topNumber < 1){
            throw new Error("Invalid number")
        }
        topNumber = parseInt(topNumber);
        const {rows : events} = await EventDB.getMostPopularEvents(client, topNumber);
        const returnEvents = [];
        for(const event of events){
            // Ajout de l'événement en plus du nombre de participants
            const idEvent = event.id_event;
            const countParticipation = parseInt(event.count);
            const {rows : obtainedEvents} = await EventDB.getEvent(client, idEvent);
            const obtainedEvent = obtainedEvents[0];
            obtainedEvent["count"] = countParticipation;

            // Ajout du nombre de stands pour les applications clientes
            const {rowCount : standCount} = await StandDB.getAllStandsEvent(client, idEvent);

            obtainedEvent["stand_count"] = standCount;
            returnEvents.push(obtainedEvent);
        }
        res.status(200).json({events : returnEvents});
    } catch(e) {
        if(e.message === "Invalid types in the request"){
            res.status(400).json({error : "Invalid types in the request"});
        } else if(e.message === "Invalid number"){
            res.status(400).json({error : "Invalid number"});
        } else {
            console.error(e);
            res.status(500).json({error: "Server error"});
        }
    } finally {
        client.release();
    }
}

/**
 * @swagger
 *  components:
 *      responses:
 *          EventInserted:
 *              description : Event successfully created
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Event created
 *                              event:
 *                                  type: object
 *                                  properties:
 *                                      id:
 *                                          type: integer
 *          CreatorNotFound:
 *              description: "Creator not found"
 *      requestBodies:
 *          EventToAdd:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              name:
 *                                  type: string
 *                              startingDate:
 *                                  type: string
 *                                  format: date-time
 *                              endingDate:
 *                                  type: string
 *                                  format: date-time
 *                              streetName:
 *                                  type: string
 *                              postalCode:
 *                                  type: integer
 *                              city:
 *                                  type: string
 *                              childrenAccepted:
 *                                  type: boolean
 *                              description:
 *                                  type: string
 *                              securityLevel:
 *                                  type: integer
 *                              requireMask:
 *                                  type: boolean
 *                              requireCovidSafeTicket:
 *                                  type: boolean
 *                              maxPlaceCount:
 *                                  type: integer
 *                              mailAddressCreator:
 *                                  type: string
 *                          required:
 *                              - name
 *                              - startingDate
 *                              - endingDate
 *                              - streetName
 *                              - postalCode
 *                              - city
 *                              - description
 *                              - securityLevel
 *                              - maxPlaceCount
 *                              - mailAddressCreator
 */
module.exports.insertEvent = async(req, res) => {
    const client = await pool.connect();
    const {name, startingDate, endingDate, streetName, houseNumber, postalCode, city, childrenAccepted = true, description,
        type, securityLevel, requireMask = true, requireCovidSafeTicket = true, maxPlaceCount, mailAddressCreator = req.user.mailAddress} = req.body;
    try {
        if(!name || !startingDate || !endingDate || !streetName || !postalCode || !city || !description || !type
            || !securityLevel || !maxPlaceCount || postalCode < 999 || postalCode > 9999 || securityLevel < 1
            || securityLevel > 5){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([name, startingDate, endingDate, streetName, city, description, type, mailAddressCreator]
            , [postalCode, houseNumber, securityLevel, maxPlaceCount]
            , [childrenAccepted, requireCovidSafeTicket, requireMask]);
        if(!mailAddressCreator.match(Tools.mailAddressRegex)){
            throw new Error("Invalid mail address format");
        }
        if(mailAddressCreator !== req.user.mailAddress){
            const userExists = await UserDB.userExists(client, mailAddressCreator);
            if(!userExists){
                throw new Error("Creator not found");
            }
        }

        const startingDateConverted = new Date(startingDate);
        const endingDateConverted = new Date(endingDate);
        if(startingDateConverted == "Invalid Date" || endingDateConverted == "Invalid Date"){
            throw new Error("Invalid Date");
        }
        if(endingDateConverted <= startingDateConverted){
            throw new Error("Invalid request body");
        }
        const {rows : events} = await EventDB.insertEvent(client, name, startingDateConverted, endingDateConverted, streetName, houseNumber, postalCode,
            city, childrenAccepted, description, type, securityLevel, requireMask, requireCovidSafeTicket, maxPlaceCount,
            mailAddressCreator);
        const event = events[0];
        res.status(201).json({message : "Event created", event : event});
    } catch(e) {
        if(e.message === "Invalid request body"){
            res.status(400).json({error : "Invalid request body, please consult the documentation"});
        } else if(e.message === "Invalid mail address format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if(e.message === "Creator not found"){
            res.status(404).json({error : "Creator not found, please verify his mail address"});
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

/**
 * @swagger
 *  components:
 *      responses:
 *          EventUpdated:
 *              description : Event successfully updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Event created
 *                              event:
 *                                  type: object
 *                                  properties:
 *                                      id:
 *                                          type: integer
 *                                      name:
 *                                          type: string
 *                                      starting_date:
 *                                          type: string
 *                                          format: date-time
 *                                      ending_date:
 *                                          type: string
 *                                          format: date-time
 *                                      street_name:
 *                                          type: string
 *                                      postal_code:
 *                                          type: integer
 *                                      city:
 *                                          type: string
 *                                      children_accepted:
 *                                          type: boolean
 *                                      description:
 *                                          type: string
 *                                      security_level:
 *                                          type: integer
 *                                      require_mask:
 *                                          type: boolean
 *                                      require_covid_safe_ticket:
 *                                          type: boolean
 *                                      max_place_count:
 *                                          type: integer
 *                                      mail_address_creator:
 *                                          type: string
 *          NothingToUpdate:
 *              description: "Nothing to update"
 *          EventNotFound:
 *              description: "Event not found"
 *      requestBodies:
 *          EventToUpdate:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              id:
 *                                  type: integer
 *                              name:
 *                                  type: string
 *                              startingDate:
 *                                  type: string
 *                                  format: date-time
 *                              endingDate:
 *                                  type: string
 *                                  format: date-time
 *                              streetName:
 *                                  type: string
 *                              postalCode:
 *                                  type: integer
 *                              city:
 *                                  type: string
 *                              childrenAccepted:
 *                                  type: boolean
 *                              description:
 *                                  type: string
 *                              securityLevel:
 *                                  type: integer
 *                              requireMask:
 *                                  type: boolean
 *                              requireCovidSafeTicket:
 *                                  type: boolean
 *                              maxPlaceCount:
 *                                  type: integer
 *                              mailAddressCreator:
 *                                  type: string
 */
module.exports.updateEvent = async (req, res) => {
    const client = await pool.connect();
    let {idEvent, name, startingDate, endingDate, streetName, houseNumber, postalCode, city, childrenAccepted, description,
        type, securityLevel, requireMask, requireCovidSafeTicket, maxPlaceCount, mailAddressCreator} = req.body;
    try {
        if(!idEvent){
            throw new Error("Invalid request body");
        }
        Tools.validationTypes([name, startingDate, endingDate, streetName, city, description, type, mailAddressCreator]
            , [idEvent, postalCode, houseNumber, securityLevel, maxPlaceCount]
            , [childrenAccepted, requireCovidSafeTicket, requireMask]);
        // Vérification du type car !requireMask = true si requireMask = false
        if(!name && !startingDate && !endingDate && !streetName && !houseNumber && !postalCode && !city && !(typeof(childrenAccepted) === 'boolean')
            && !description && !type && !securityLevel && !(typeof(requireMask) === 'boolean') && !(typeof(requireCovidSafeTicket) === 'boolean') && !maxPlaceCount && !mailAddressCreator){
            throw new Error("Nothing to update");
        }
        if(mailAddressCreator){
            if(!mailAddressCreator.match(Tools.mailAddressRegex)){
                throw new Error("Invalid mail address format");
            }
            const userExists = await UserDB.userExists(client, mailAddressCreator);
            if(!userExists){
                throw new Error("Creator not found");
            }
        }
        const {rows : events} = await EventDB.getEvent(client, idEvent);
        const event = events[0];
        if(!event){
            throw new Error("Event not found");
        }

        name = name ?? event.name;
        startingDate = startingDate ?? event.starting_date;
        endingDate = endingDate ?? event.ending_date;
        streetName = streetName ?? event.street_name;
        houseNumber = houseNumber ?? event.house_number;
        postalCode = postalCode ?? event.postal_code;
        city = city ?? event.city;
        childrenAccepted = childrenAccepted ?? event.children_accepted;
        description = description ?? event.description;
        type = type ?? event.type;
        securityLevel = securityLevel ?? event.security_level;
        requireMask = requireMask ?? event.require_mask;
        requireCovidSafeTicket = requireCovidSafeTicket ?? event.require_covid_safe_ticket;
        maxPlaceCount = maxPlaceCount ?? event.max_place_count;
        mailAddressCreator = mailAddressCreator ?? event.mail_address_creator;

        if(postalCode < 999 || postalCode > 9999 || securityLevel < 1 || securityLevel > 5){
            throw new Error("Invalid request body");
        }

        const startingDateConverted = new Date(startingDate);
        const endingDateConverted = new Date(endingDate);
        if(startingDateConverted == "Invalid Date" || endingDateConverted == "Invalid Date"){
            throw new Error("Invalid Date");
        }

        const {rows : updatedEvents} = await EventDB.updateEvent(client, name, idEvent, startingDate, endingDate, streetName, houseNumber, postalCode, city,
            childrenAccepted, description, type, securityLevel, requireMask, requireCovidSafeTicket, maxPlaceCount,
            mailAddressCreator);
        const updatedEvent = updatedEvents[0];
        res.status(200).json({message : "Event updated", event : updatedEvent});
    } catch(e) {
        if (e.message === "Invalid request body") {
            res.status(400).json({error: "Invalid request body, please consult the documentation"});
        } else if(e.message === "Invalid mail address format"){
            res.status(400).json({error : "Invalid mail address, use the format : xxx@yyy.zz"});
        } else if(e.message === "Creator not found"){
            res.status(404).json({error : "Creator not found, please verify his mail address"});
        } else if(e.message === "Nothing to update"){
            res.status(400).json({error : "No updatable attribute"});
        } else if(e.message === "Event not found"){
            res.status(404).json({error: "Event not found"});
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

/**
 * @swagger
 *  components:
 *      responses:
 *          DeleteEvent:
 *              description: The Event (and his relationship) has successfully been deleted
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Event deleted
 *      requestBodies:
 *          DeleteEvent:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          properties:
 *                              idEvent:
 *                                  type: integer
 */
module.exports.deleteEvent = async (req, res) => {
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

        // Supprimer les participations de cet event
        await ParticipationDB.deleteAllParticipationsEvent(client, idEvent);

        // Supprimer les stands et leurs objects
        const {rows : stands} = await StandDB.getAllStandsEvent(client, idEvent);
        for(const stand of stands) {
            const idStand = stand.id;
            const {rows: products} = await StandDB.getAllProductsStand(client, idStand);
            for (const product of products) {
                const idProduct = product.id;
                await ObjectDB.deleteObject(client, idStand, idProduct);
            }
            await StandDB.deleteStand(client, idStand);
        }
        await EventDB.deleteEvent(client, idEvent);
        await client.query("COMMIT;");
        res.status(200).json({message : "Event deleted"});
    } catch(e) {
        await client.query("ROLLBACK;");
        if (e.message === "Invalid request body") {
            res.status(400).json({error: "Invalid request body"});
        } else if(e.message === "Event not found") {
            res.status(404).json({error: "Event not found"});
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