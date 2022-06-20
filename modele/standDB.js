module.exports.standExists = async (client, id) => {
    const {rows} = await client.query(`
         SELECT count(id) AS number FROM stand
         WHERE id = $1
        `, [id]);
    return rows[0].number > 0;
}

// Obtenir un stand de l'événement
module.exports.getStand = async (client, id) => {
    return await client.query(`
        SELECT type, manager_name, area_size, id_event FROM stand 
        WHERE id = $1
    `, [id]);
}

// Obtenir tous les stands
module.exports.getAllStands = async (client) => {
    return await client.query(`
        SELECT * FROM stand 
    `);
};

// Obtenir tous les stands d'un événement
module.exports.getAllStandsEvent = async (client, idEvent) => {
    return await client.query(`
        SELECT id, type, manager_name, area_size FROM stand 
        WHERE id_event = $1
    `, [idEvent]);
}

// Obtenir tous les produits vendus sur un stand d'un événement
module.exports.getAllProductsStand = async (client, id) => {
    return await client.query(`
        SELECT p.* FROM stand s, object o, product p
        WHERE s.id = $1 AND o.id_stand = s.id AND o.id_product = p.id 
    `, [id]);
}

// Insérer à un stand à un événement
module.exports.insertStand = async (client, type, managerName, areaSize, idEvent) => {
    return await client.query(`
        INSERT INTO stand(type, manager_name, area_size, id_event)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `, [type, managerName, areaSize, idEvent]);
}

// Mettre à jour un stand (sauf modifier son événement)
module.exports.updateStand = async (client, id, type, managerName, areaSize, idEvent) => {
    return await client.query(`
        UPDATE stand
        SET type = $1, manager_name = $2, area_size = $3, id_event = $4
        WHERE id = $5
        RETURNING *
    `, [type, managerName, areaSize, idEvent, id]);
}

// Supprimer un stand
module.exports.deleteStand = async (client, id) => {
    return await client.query(`
        DELETE FROM stand
        WHERE id = $1
    `, [id]);
}
