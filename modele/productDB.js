module.exports.productExists = async (client, id) => {
    const {rows} = await client.query(`
         SELECT count(id) AS number FROM product
         WHERE id = $1
        `, [id]);
    return rows[0].number > 0;
}

module.exports.getProduct = async (client, id) => {
    return await client.query(`
        SELECT name, description, price FROM product 
        WHERE id = $1
    `, [id]);
}

module.exports.getAllProducts = async (client) => {
    return await client.query(`
        SELECT * FROM product 
    `);
}

module.exports.insertProduct = async (client, name, description, price) => {
    return await client.query(`
        INSERT INTO product(name, description, price)
        VALUES ($1, $2, $3)
        RETURNING *
    `, [name, description, price]);
}

module.exports.updateProduct = async (client, id, name, description, price) => {
    return await client.query(`
        UPDATE product
        SET name = $1, description = $2, price = $3
        WHERE id = $4
        RETURNING *
    `, [name, description, price, id]);
}

module.exports.deleteProduct = async (client, id) => {
    return await client.query(`
        DELETE FROM product
        WHERE id = $1
    `, [id]);
}