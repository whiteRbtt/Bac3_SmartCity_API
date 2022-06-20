module.exports.participationExists = async (client, mailAddress, idEvent) => {
    const {rows} = await client.query(`
         SELECT count(*) AS number FROM participation
         WHERE mail_address_user = $1 AND id_event = $2
        `, [mailAddress, idEvent]);
    return rows[0].number > 0;
}

module.exports.getParticipation = async (client, mailAddress, idEvent) => {
    return await client.query(`
        SELECT * FROM participation 
        WHERE mail_address_user = $1 AND id_event = $2
    `, [mailAddress, idEvent]);
}

module.exports.getAllParticipations = async (client) => {
    return await client.query(`
        SELECT participation.mail_address_user, participation.id_event,event.name, participation.register_date
        FROM participation
        INNER JOIN event ON event.id = participation.id_event
    `);
};

module.exports.getAllParticipationsUser = async (client, mailAddress) => {
    return await client.query(`
        SELECT id_event, register_date FROM participation 
        WHERE mail_address_user = $1
    `, [mailAddress]);
}

module.exports.getAllParticipationsEvent = async (client, idEvent) => {
    return await client.query(`
        SELECT mail_address_user, register_date FROM participation 
        WHERE id_event = $1
    `, [idEvent]);
}

module.exports.getParticipationCountEvent = async (client, idEvent) => {
    return await client.query(`
        SELECT count(*) AS participation_count
        FROM participation
        WHERE id_event = $1
    `, [idEvent]);
}

module.exports.getParticipationsUserBetween = async (client, mailAddress, startingDate, endingDate) => {
    return await client.query(`
        SELECT p.id_event, p.register_date FROM participation p, event e
        WHERE p.id_event = e.id AND p.mail_address_user = $1
        AND ((e.starting_date BETWEEN $2 AND $3) OR (e.ending_date BETWEEN $2 AND $3)
           OR ($2 BETWEEN e.starting_date AND e.ending_date) OR ($3 BETWEEN e.starting_date AND e.ending_date))
    `, [mailAddress, startingDate, endingDate]);
}

module.exports.insertParticipation = async (client, mailAddress, idEvent, registerDate = new Date()) => {
    return await client.query(`
        INSERT INTO participation(mail_address_user, id_event, register_date)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [mailAddress, idEvent, registerDate]);
}

module.exports.updateParticipation = async (client, mailAddress, idEvent, registerDate, newMailAddress, newIdEvent) => {
    return await client.query(`
        UPDATE participation
        SET mail_address_user = $1, id_event = $2, register_date = $3
        WHERE mail_address_user = $4 AND id_event = $5
        RETURNING *
    `, [newMailAddress, newIdEvent, registerDate, mailAddress, idEvent]);
}

module.exports.deleteParticipation = async (client, mailAddress, idEvent) => {
    return await client.query(`
        DELETE FROM participation
        WHERE mail_address_user = $1 AND id_event = $2
    `, [mailAddress, idEvent]);
}

module.exports.deleteAllParticipationsUser = async (client, mailAddress) => {
    return await client.query(`
        DELETE FROM participation
        WHERE mail_address_user = $1
    `, [mailAddress]);
}

module.exports.deleteAllParticipationsEvent = async (client, idEvent) => {
    return await client.query(`
        DELETE FROM participation
        WHERE id_event = $1
    `, [idEvent]);
}


