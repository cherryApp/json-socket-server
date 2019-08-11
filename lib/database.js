const uuidv1 = require('uuid/v1');
const trivialdb = require('trivialdb');
 
// Open or create a database
const db = trivialdb.db('json-db', {idFunc: uuidv1});

const save = async (data) => {
    return new Promise( async (resolve, reject) => {
        await db.loading;
        let id = await db.save(data);
        resolve(id);
    });
};

module.exports = {
    save: save
};