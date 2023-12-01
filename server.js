"use strict";
/* eslint-disable @typescript-eslint/no-inferrable-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUp = exports.init = exports.DigikamGasketConfig = exports.Image = exports.Album = void 0;
const tslib_1 = require("tslib");
// Importing packages that are available in the main app (listed in the packages.json in pigallery2)
const typeorm_1 = require("typeorm");
const SubConfigClass_1 = require("typeconfig/src/decorators/class/SubConfigClass");
const ConfigPropoerty_1 = require("typeconfig/src/decorators/property/ConfigPropoerty");
const path = require("path");
const util = require("util");
// https://github.com/typeorm/typeorm/blob/master/docs/entities.md#what-is-entity
let Album = class Album {
};
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    tslib_1.__metadata("design:type", Number)
], Album.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], Album.prototype, "albumRoot", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Album.prototype, "relativePath", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Date)
], Album.prototype, "date", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Album.prototype, "caption", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Album.prototype, "collection", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(type => Image),
    (0, typeorm_1.JoinColumn)({ name: 'icon' }),
    tslib_1.__metadata("design:type", Object)
], Album.prototype, "icon", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Date)
], Album.prototype, "modificationDate", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => Image, (image) => image.album),
    tslib_1.__metadata("design:type", Array)
], Album.prototype, "images", void 0);
Album = tslib_1.__decorate([
    (0, typeorm_1.Entity)('Albums')
], Album);
exports.Album = Album;
let Image = class Image {
};
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    tslib_1.__metadata("design:type", Number)
], Image.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => Album, (album) => album.images),
    (0, typeorm_1.JoinColumn)({ name: 'album' }),
    tslib_1.__metadata("design:type", Album)
], Image.prototype, "album", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Image.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], Image.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], Image.prototype, "category", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Date)
], Image.prototype, "modificationDate", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], Image.prototype, "fileSize", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Image.prototype, "uniqueHash", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", Number)
], Image.prototype, "manualOrder", void 0);
Image = tslib_1.__decorate([
    (0, typeorm_1.Entity)('Images')
], Image);
exports.Image = Image;
// Using https://github.com/bpatrik/typeconfig for configuration
let DigikamGasketConfig = class DigikamGasketConfig {
    constructor() {
        this.digikamShowCollection = 'Public';
        this.digikamDbType = 'MySQL';
        this.digikamSqliteDb = '/app/data/digikam/digikam.db';
        this.digikamMysqlHost = 'localhost';
        this.digikamMysqlPort = 3306;
        this.digikamMysqlDb = 'digikam';
        this.digikamMysqlUser = 'digikam';
        this.digikamMysqlPassword = 'password';
    }
};
tslib_1.__decorate([
    (0, ConfigPropoerty_1.ConfigProperty)({ description: 'DigiKam Collection' }) // FIXME: improve description
    ,
    tslib_1.__metadata("design:type", String)
], DigikamGasketConfig.prototype, "digikamShowCollection", void 0);
tslib_1.__decorate([
    (0, ConfigPropoerty_1.ConfigProperty)({ description: 'DigiKam Database Type (MySQL or SQLite)' }),
    tslib_1.__metadata("design:type", String)
], DigikamGasketConfig.prototype, "digikamDbType", void 0);
tslib_1.__decorate([
    (0, ConfigPropoerty_1.ConfigProperty)({ description: 'DigiKam SQLite DB filename' }),
    tslib_1.__metadata("design:type", String)
], DigikamGasketConfig.prototype, "digikamSqliteDb", void 0);
tslib_1.__decorate([
    (0, ConfigPropoerty_1.ConfigProperty)({ description: 'DigiKam MySQL DB hostname' }),
    tslib_1.__metadata("design:type", String)
], DigikamGasketConfig.prototype, "digikamMysqlHost", void 0);
tslib_1.__decorate([
    (0, ConfigPropoerty_1.ConfigProperty)({ description: 'DigiKam MySQL DB port' }),
    tslib_1.__metadata("design:type", Number)
], DigikamGasketConfig.prototype, "digikamMysqlPort", void 0);
tslib_1.__decorate([
    (0, ConfigPropoerty_1.ConfigProperty)({ description: 'DigiKam MySQL DB name' }),
    tslib_1.__metadata("design:type", String)
], DigikamGasketConfig.prototype, "digikamMysqlDb", void 0);
tslib_1.__decorate([
    (0, ConfigPropoerty_1.ConfigProperty)({ description: 'DigiKam MySQL DB username' }),
    tslib_1.__metadata("design:type", String)
], DigikamGasketConfig.prototype, "digikamMysqlUser", void 0);
tslib_1.__decorate([
    (0, ConfigPropoerty_1.ConfigProperty)({ description: 'DigiKam MySQL DB password' }),
    tslib_1.__metadata("design:type", String)
], DigikamGasketConfig.prototype, "digikamMysqlPassword", void 0);
DigikamGasketConfig = tslib_1.__decorate([
    (0, SubConfigClass_1.SubConfigClass)({ softReadonly: true })
], DigikamGasketConfig);
exports.DigikamGasketConfig = DigikamGasketConfig;
const init = async (extension) => {
    extension.Logger.debug(`My extension is setting up. name: ${extension.extensionName}, id: ${extension.extensionId}`);
    /**
     * (Optional) Setting the configuration template
     */
    extension.config.setTemplate(DigikamGasketConfig);
    /**
     * Set up DigiKam DB connection
     */
    const opts = (extension.config.getConfig().digikamDbType === 'MySQL')
        ? {
            type: 'mysql',
            host: extension.config.getConfig().digikamMysqlHost,
            port: extension.config.getConfig().digikamMysqlPort,
            database: extension.config.getConfig().digikamMysqlDb,
            username: extension.config.getConfig().digikamMysqlUser,
            password: extension.config.getConfig().digikamMysqlPassword,
            entities: [Album, Image],
            logging: true
        }
        : {
            type: 'better-sqlite3',
            database: extension.config.getConfig().digikamSqliteDb,
            entities: [Album, Image]
        };
    const DigikamDataSource = new typeorm_1.DataSource(opts);
    DigikamDataSource.initialize()
        .then(async () => {
        extension.Logger.debug('My extension has successfully connected to the DigiKam DB');
        // const albums = DigikamDataSource.getRepository(Album)
        // const publicAlbums = await albums.findBy({ collection: extension.config.getConfig().digikamShowCollection })
        // extension.Logger.silly('public albums: ', JSON.stringify(publicAlbums, undefined, 2))
    })
        .catch((err) => {
        extension.Logger.debug(`My extension encountered an error when connecting to the DigiKam DB: ${err}`);
    });
    /**
     * Only index directories tagged with the right collection
     */
    const baseQuery = () => {
        const query = DigikamDataSource.getRepository(Album)
            .createQueryBuilder('album')
            .where('album.collection = :collection', { collection: extension.config.getConfig().digikamShowCollection });
        return query;
    };
    const indexDir = async (dir) => {
        extension.Logger.silly(`indexDir:${dir}`);
        // https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md#adding-where-expression
        const count = await baseQuery()
            .andWhere(new typeorm_1.Brackets((qb) => {
            qb.where('album.relativePath = :dir', { dir })
                .orWhere('album.relativePath LIKE :path', { path: `${dir}/%` });
        }))
            .getCount();
        extension.Logger.silly(`public album count:${count}`);
        return count > 0;
    };
    const showDirPics = async (dir) => {
        extension.Logger.silly(`showDirPics:${dir}`);
        // https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md#adding-where-expression
        const count = await baseQuery()
            .andWhere('album.relativePath = :dir', { dir })
            .getCount();
        extension.Logger.silly(`public album count:${count}`);
        return count > 0;
    };
    // https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/
    const asyncFilter = async (arr, predicate) => {
        const results = await Promise.all(arr.map(predicate));
        return arr.filter((_v, index) => results[index]);
    };
    extension.events.gallery.DiskManager
        .scanDirectory.after(async (output) => {
        // extension.Logger.silly('scanDirectory.after: ', JSON.stringify(output, undefined, 2));
        // FIXME: this would be better accomplished by having an extension hook into DiskManager.excludeDir, but this works.
        // https://www.aleksandrhovhannisyan.com/blog/async-functions-that-return-booleans/
        const dirs = await asyncFilter(output.directories, async (dir) => { const val = await indexDir(path.join(path.sep, dir.path, dir.name)); return val; });
        output.directories = dirs;
        // don't show any photos in this directory if it's not the right collection
        const showPics = await showDirPics(path.join(path.sep, output.path, output.name));
        if (!showPics) {
            output.media = [];
        }
        // extension.Logger.silly('scanDirectory.after2: ', JSON.stringify(output, undefined, 2));
        return output;
    });
    /**
     * Select covers specified in DigiKam (if present)
     * */
    extension.events.gallery.CoverManager
        .getCoverForDirectory.before(async (input, event) => {
        extension.Logger.silly('getCoverForDirectory.before: ', JSON.stringify(input, undefined, 2));
        const inputQuery = input.inputs[0];
        const albumPath = (inputQuery.path === './')
            ? path.join(path.sep, inputQuery.name)
            : path.join(path.sep, inputQuery.path, inputQuery.name);
        const albumInfo = await DigikamDataSource.getRepository(Album)
            .createQueryBuilder('album')
            .leftJoinAndSelect('album.icon', 'icon')
            .leftJoinAndSelect('icon.album', 'iconalbum')
            .where('album.relativepath = :path', { path: albumPath })
            .limit(1)
            .getOne();
        extension.Logger.silly('getCoverForDirectory.before2: ', JSON.stringify(albumInfo, undefined, 2));
        if (albumInfo.icon == null) {
            return input;
        }
        const conn = await extension.db.getSQLConnection();
        const mediaEntity = extension.db._getAllTables().find((entity) => entity.name === 'MediaEntity');
        const coverMedia = await conn
            .getRepository(mediaEntity)
            .createQueryBuilder('media')
            .innerJoin('media.directory', 'directory')
            .select(['media.name', 'media.id', 'directory.name', 'directory.path'])
            .where('media.name = :mediaName', { mediaName: albumInfo.icon.name })
            .andWhere('directory.name = :dirName', { dirName: path.basename(albumInfo.icon.album.relativePath) })
            .andWhere('directory.path = :dirPath', { dirPath: path.join(path.dirname(albumInfo.icon.album.relativePath), path.sep).replace(/^\/+/, '') })
            .limit(1)
            .getOne();
        extension.Logger.silly('getCoverForDirectory.before3: ', util.inspect(coverMedia));
        if (coverMedia != null) {
            event.stopPropagation = true;
            return coverMedia;
        }
        return input;
    });
    extension.events.gallery.CoverManager
        .getCoverForDirectory.after(async (output) => {
        extension.Logger.silly('getCoverForDirectory.after: ', JSON.stringify(output, undefined, 2));
        return output;
    });
};
exports.init = init;
const cleanUp = async (extension) => {
    extension.Logger.debug('Cleaning up');
    // FIXME: probably need to reset digiKam data source
    /*
    * No need to clean up changed through extension.db,  extension.RESTApi or extension.events
    * */
};
exports.cleanUp = cleanUp;
//# sourceMappingURL=server.js.map