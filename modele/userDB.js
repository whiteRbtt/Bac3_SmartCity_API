const sharp = require('sharp');

module.exports.userExists = async (client, mailAddress) => {
    const {rows} = await client.query(`
         SELECT count(*) AS number FROM users
         WHERE mail_address = $1
        `, [mailAddress]);
    return rows[0].number > 0;
}

module.exports.getUser = async (client, mailAddress) => {
    return await client.query(`
        SELECT * FROM users
        WHERE mail_address = $1`, [mailAddress]
    );
}

module.exports.getProfilePicture = async (client, mailAddress) => {
    return await client.query(`
        SELECT profile_picture FROM users
        WHERE mail_address = $1`, [mailAddress]
    );
}

module.exports.getAllUsers = async (client) => {
    return await client.query(`
        SELECT mail_address, password, name, birthdate, role FROM users 
    `);
}

module.exports.insertUser = async (client, mailAddress, password, name, birthdate, role = "user") => {
    return await client.query(`
        INSERT INTO users(mail_address, password, name, birthdate, role) VALUES  
        ($1, $2, $3, $4, $5)
        RETURNING *
        `, [mailAddress, password, name, birthdate, role]
    );
}

module.exports.updateProfilePicture = async (client, mailAddress, imageBuffer) => {
    const resizedAvatarBuffer = await sharp(imageBuffer)
                            .jpeg()
                            .resize(150, 150)
                            .toBuffer();

    const resizedAvatarString = "data:image/jpeg;base64," + resizedAvatarBuffer.toString("base64");

    await client.query(`
        UPDATE users
        SET profile_picture = $2
        WHERE mail_address = $1
        `, [mailAddress, resizedAvatarString]
    );

    return resizedAvatarString;
}

module.exports.updateUser = async (client, mailAddress, newMailAddress, name, password, birthdate, role) => {
    return await client.query(`
        UPDATE users
        SET mail_address = $2, password = $3, birthdate = $4, role = $5, name = $6
        WHERE mail_address = $1
        RETURNING *
        `, [mailAddress, newMailAddress, password, birthdate, role, name]
    );
}

module.exports.deleteUser = async (client, mailAddress) => {
    return await client.query(`
        DELETE FROM users
        WHERE mail_address = $1
    `, [mailAddress]);
}