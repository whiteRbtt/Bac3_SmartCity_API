module.exports.objectExists = async (client, idStand, idProduct) => {
    const {rows} = await client.query(`
         SELECT count(*) AS number FROM object
         WHERE id_stand = $1 AND id_product = $2
        `, [idStand, idProduct]);
    return rows[0].number > 0;
}

module.exports.getObject = async (client, idStand, idProduct) => {
    return await client.query(`
        SELECT * FROM object
        WHERE id_stand = $1 AND id_product = $2
    `, [idStand, idProduct]);
}

module.exports.getAllObjects = async (client) => {
    return await client.query(`
        SELECT stand.type AS type_stand, object.id_stand, product.name AS name_product,object.id_product
        FROM object
        INNER JOIN product ON product.id = object.id_product
        INNER JOIN stand ON stand.id = object.id_stand
    `);
};

module.exports.insertObject = async (client, idStand, idProduct) => {
    return await client.query(`
        INSERT INTO object(id_stand, id_product)
        VALUES ($1, $2)
        RETURNING *
    `, [idStand, idProduct]);
}

module.exports.updateObject = async (client, idStand, idProduct, newIdStand, newIdProduct) => {
    return await client.query(`
        UPDATE object
        SET id_stand = $1, id_product = $2
        WHERE id_stand = $3 AND id_product = $4
        RETURNING *
    `, [newIdStand, newIdProduct, idStand, idProduct]);
}

module.exports.deleteObject = async (client, idStand, idProduct) => {
    return await client.query(`
        DELETE FROM object
        WHERE id_stand = $1 AND id_product = $2
    `, [idStand, idProduct]);
}

module.exports.deleteObjectsProduct = async (client, idProduct) => {
    return await client.query(`
        DELETE FROM object
        WHERE id_product = $1
    `, [idProduct]);
}

module.exports.deleteObjectsStand = async (client, idStand) => {
    return await client.query(`
        DELETE FROM object
        WHERE id_stand = $1
    `, [idStand]);
}