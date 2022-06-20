require('dotenv').config();
const bcrypt = require("bcrypt");
module.exports.mailAddressRegex = RegExp("(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])");
module.exports.passwordRegex = RegExp(".{6,32}");
const saltRounds = parseInt(process.env.SALT_ROUNDS);
const validRoles = ['user', 'admin'];

module.exports.passwordHash = async (password) => {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

module.exports.validationBirthdate = (birthdate) => {
    const convertedDate = new Date(birthdate);
    if(convertedDate == "Invalid Date"){
        throw new Error("Invalid birthdate : wrong input");
    }
    const yearDifference = parseInt((Date.now() - convertedDate) / (1000 * 60 * 60 * 24 * 365));
    const validBirthDate = yearDifference >= 18 && yearDifference <= 120;
    if(!validBirthDate){
        throw new Error("Invalid birthdate : age");
    }
    return convertedDate;
}

module.exports.validationTypes = (strings = [], numbers = [], booleans = []) => {
    // undefined pour les attributs facultatifs
    for(const string of strings){
        if(string !== undefined && typeof(string) !== "string"){
            throw new Error("Invalid types in the request");
        }
    }
    // Pour les attributs query, ils sont convertis en Number --> NaN si ce ne sont pas des nombres
    for(const number of numbers){
        if(number !== undefined && (isNaN(number) || typeof(number) !== "number")){
            throw new Error("Invalid types in the request");
        }
    }
    for(const boolean of booleans){
        if(boolean !== undefined && typeof(boolean) !== "boolean"){
            throw new Error("Invalid types in the request");
        }
    }
}

module.exports.validRoles = (role) => {
    return validRoles.includes(role);
}

// Système de gestion de tokens :

// Chaque objet du tableau sera sous la forme {mailAddress : xxx, token : yyy}
let validTokens = [];
// Par simplicité lors du testing et du développement, j'ajoute deux objets, représentant un admin et un utilisateur.
const admin = {mailAddress : 'goldbridge@gmail.be', token : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Im1haWxBZGRyZXNzIjoiZ29sZGJyaWRnZUBnbWFpbC5iZSIsIm5hbWUiOiJQYXVsYSIsInJvbGUiOiJhZG1pbiJ9LCJpYXQiOjE2MzcwNjU4NzcsImV4cCI6MTY0Nzg2NTg3N30.sNIEMhqw_XXy2fnmjgx27wfR4-WdswWrXME5pqiZC4o'};
const user = {mailAddress : 'kdbthebest@gmail.com', token : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Im1haWxBZGRyZXNzIjoia2RidGhlYmVzdEBnbWFpbC5jb20iLCJuYW1lIjoiUm9iaW5vIiwicm9sZSI6InVzZXIifSwiaWF0IjoxNjM3MDY1OTE2LCJleHAiOjE2NDc4NjU5MTZ9.sGBxsQjvg0ARFsIP_Cp3R9-917_feDorzmqZ0taNBDQ'};
validTokens.push(admin);
validTokens.push(user);

module.exports.validToken = (mailAddress, token) => {
    const index = validTokens.findIndex(element => element.mailAddress === mailAddress && element.token === token);
    return index !== -1;
}

module.exports.addValidToken = (mailAddress, token) => {
    const obj = {mailAddress : mailAddress, token : token};
    validTokens.push(obj);
}

module.exports.deleteValidTokens = (mailAddress) => {
    validTokens = validTokens.filter(elem => elem.mailAddress !== mailAddress);
}