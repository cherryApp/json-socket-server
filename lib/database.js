const path = require('path');
const fs = require('fs');
const shortid = require('shortid');
const uuidv1 = require('uuid/v1');
const trivialdb = require('trivialdb');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

module.exports = class DB {
    constructor(filePath, watching = false) {
        this.absoluteFilePath = path.join('.', filePath);
        this.adapter = new FileSync(this.absoluteFilePath);
        this.db = low(this.adapter);
        
        // Set some defaults
        this.db.defaults({ posts: [], user: {} })
            .write();
        
        // Watch changes when watching argument is true.
        this.watching = watching;
        this.tempDisableWatching = false;
        this.startWatching();

    }

    startWatching() {
        if (!this.watching) {
            return;
        }

        if (this.tempDisableWatching) {
            this.tempDisableWatching = false;
            return;
        }

        fs.watch(this.absoluteFilePath, (curr, prev) => {
            console.log('Refresh db file!');
        });
    }

    read(path, id = null) {
        return new Promise( (resolve, reject) => {
            let result = [];
            if (!id) {
                result = this.db.get(path)
                    .value()
                    .sort( (a, b) => a.id - b.id ); 
            } else {
                result = this.db.get(path)
                    .find({id: id})
                    .value();
            }

            resolve(result);
        });
    }

    create(path, data) {
        return new Promise( (resolve, reject) => {
            const newId = this.getLastId(path) + 1;
            this.db
                .get(path)
                .push(Object.assign({id: newId}, data))
                .write();

            const newObject = this.db
                .get(path)
                .find({ id: newId })
                .value();

            resolve(newObject);
        });
    }

    update(path, data) {
        return new Promise( (resolve, reject) => {
            this.db.get(path)
                .find({ id: data.id })
                .assign(data)
                .write();

            const refreshedObject = this.db
                .get(path)
                .find({ id: data.id })
                .value();

            resolve(refreshedObject);
        });
    }

    delete(path, id = null) {
        return new Promise( (resolve, reject) => {
            if (!id) {
                return reject('ID not provided!');
            }

            this.db.get(path)
                .remove({ id: id })
                .write();

            resolve({command: 'delete', id: id});
        });
    }

    getLastId(path) {
        if (this.db.has(path)) {
            let sorted = this.db.get(path)
                .value()
                .sort( (a, b) => {
                    return b.id - a.id;
                });
            
            return sorted[0] ? sorted[0].id : 1;
        }
        return 1;
    } 
}

// TODO: test lowdb.
 
// Open or create a database
/*const db = trivialdb.db('json-db', {idFunc: uuidv1});

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
*/