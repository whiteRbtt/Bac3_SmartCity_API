module.exports.eventExists = async (client, id) => {
    const {rows} = await client.query(`
         SELECT count(id) AS number FROM event
         WHERE id = $1
        `, [id]);
    return rows[0].number > 0;
}

module.exports.getEvent = async (client, id) => {
    return await client.query(`
        SELECT * FROM event
        WHERE id = $1
    `, [id]);
}

module.exports.getAllEvents = async (client) => {
    return await client.query(`
        SELECT * FROM event 
    `);
}

module.exports.getAllEventsCreatedByUser = async (client, mailAddress) => {
    return await client.query(`
        SELECT * FROM event 
        WHERE mail_address_creator = $1
    `, [mailAddress]);
}

// city est optionnel
module.exports.searchUpcomingEvents = async (client , city) => {
    const date = new Date();
    if(!city){
        return await client.query(`
        SELECT * FROM event
        WHERE starting_date >= $1 OR ending_date >= $1
        `, [date]);
    }
    return await client.query(`
        SELECT * FROM event
        WHERE (starting_date >= $1 OR ending_date >= $1) AND LOWER(city) = $2
        `, [date, city.toLowerCase()]);
}

module.exports.getMostPopularEvents = async (client, topNumber) => {
    return await client.query(`
        SELECT id_event, count(*) FROM participation p
        GROUP BY id_event
        ORDER BY count(*) desc
        FETCH FIRST $1 rows only
    `, [topNumber]);
}

// city est optionnel
module.exports.searchEvents = async (client, date, city) => {
    if(!city){
        return await client.query(`
        SELECT * FROM event
        WHERE starting_date <= $1 AND ending_date >= $1
        `, [date]);
    }
    return await client.query(`
        SELECT * FROM event
        WHERE starting_date <= $1 AND ending_date >= $1 AND LOWER(city) = $2
    `, [date, city.toLowerCase()]);
}

module.exports.insertEvent = async (client, name, startingDate, endingDate, streetName, houseNumber, postalCode,
         city, childrenAccepted, description, type, securityLevel, requireMask, requireCovidSafeTicket,
         maxPlaceCount, mailAddressCreator) => {
    return await client.query(`
    INSERT INTO event(name, starting_date, ending_date, street_name, house_number, postal_code, city, children_accepted,
        description, type, security_level, require_mask, require_covid_safe_ticket, max_place_count, mail_address_creator)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id
    `, [name, startingDate, endingDate, streetName, houseNumber, postalCode, city, childrenAccepted, description, type,
            securityLevel, requireMask, requireCovidSafeTicket, maxPlaceCount, mailAddressCreator]);
}

module.exports.updateEvent = async (client, name, id, startingDate, endingDate, streetName, houseNumber, postalCode,
        city, childrenAccepted, description, type, securityLevel, requireMask, requireCovidSafeTicket,
        maxPlaceCount, mailAddressCreator) => {
    return await client.query(`
    UPDATE event
    SET name = $1, starting_date = $2, ending_date = $3, street_name = $4, house_number = $5, postal_code = $6, city = $7,
        children_accepted = $8, description = $9, type = $10, security_level = $11, require_mask = $12,
        require_covid_safe_ticket = $13, max_place_count = $14, mail_address_creator = $15
    WHERE id = $16
    RETURNING *
    `, [name, startingDate, endingDate, streetName, houseNumber, postalCode, city, childrenAccepted, description, type,
            securityLevel, requireMask, requireCovidSafeTicket, maxPlaceCount, mailAddressCreator, id]);
}

module.exports.deleteEvent = async (client, id) => {
    return await client.query(`
        DELETE FROM event
        WHERE id = $1
    `, [id]);
}