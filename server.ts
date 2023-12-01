/* eslint-disable @typescript-eslint/no-inferrable-types */

// Including dev-kit interfaces. It is not necessary, only helps development with types.
// You need to prefix them with ./node_modules
import { type IExtensionObject } from './node_modules/pigallery2-extension-kit'
import { type ParentDirectoryDTO } from './node_modules/pigallery2-extension-kit/lib/common/entities/DirectoryDTO'
import { type CoverPhotoDTOWithID } from './node_modules/pigallery2-extension-kit/lib/backend/model/database/CoverManager'

// Importing packages that are available in the main app (listed in the packages.json in pigallery2)
import { DataSource, type DataSourceOptions, type SelectQueryBuilder, Entity, PrimaryGeneratedColumn, Column, Brackets, ManyToOne, OneToMany, JoinColumn, Relation } from 'typeorm'
import { SubConfigClass } from 'typeconfig/src/decorators/class/SubConfigClass'
import { ConfigProperty } from 'typeconfig/src/decorators/property/ConfigPropoerty'
import * as path from 'path'
import * as util from 'util'

// https://github.com/typeorm/typeorm/blob/master/docs/entities.md#what-is-entity
@Entity('Albums')
export class Album {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    albumRoot: number

  @Column()
    relativePath: string

  @Column()
    date: Date

  @Column()
    caption: string

  @Column()
    collection: string

  @ManyToOne(type => Image)
  @JoinColumn({ name: 'icon' })
    icon: Relation<Image>

  @Column()
    modificationDate: Date

  @OneToMany(() => Image, (image) => image.album)
    images: Array<Relation<Image>>
}
@Entity('Images')
export class Image {
  @PrimaryGeneratedColumn()
    id: number

  @ManyToOne(() => Album, (album) => album.images)
  @JoinColumn({ name: 'album' })
    album: Album

  @Column()
    name: string

  @Column()
    status: number

  @Column()
    category: number

  @Column()
    modificationDate: Date

  @Column()
    fileSize: number

  @Column()
    uniqueHash: string

  @Column()
    manualOrder: number
}

export type dbTypes = 'MySQL' | 'SQLite'

// Using https://github.com/bpatrik/typeconfig for configuration
@SubConfigClass({ softReadonly: true })
export class DigikamGasketConfig {
  @ConfigProperty({ description: 'DigiKam Collection' })// FIXME: improve description
    digikamShowCollection: string = 'Public'

  @ConfigProperty({ description: 'DigiKam Database Type (MySQL or SQLite)' })
    digikamDbType: dbTypes = 'MySQL'

  @ConfigProperty({ description: 'DigiKam SQLite DB filename' })
    digikamSqliteDb: string = '/app/data/digikam/digikam.db'

  @ConfigProperty({ description: 'DigiKam MySQL DB hostname' })
    digikamMysqlHost: string = 'localhost'

  @ConfigProperty({ description: 'DigiKam MySQL DB port' })
    digikamMysqlPort: number = 3306

  @ConfigProperty({ description: 'DigiKam MySQL DB name' })
    digikamMysqlDb: string = 'digikam'

  @ConfigProperty({ description: 'DigiKam MySQL DB username' })
    digikamMysqlUser: string = 'digikam'

  @ConfigProperty({ description: 'DigiKam MySQL DB password' })
    digikamMysqlPassword: string = 'password'
}

export const init = async (extension: IExtensionObject<DigikamGasketConfig>): Promise<void> => {
  extension.Logger.debug(`My extension is setting up. name: ${extension.extensionName}, id: ${extension.extensionId}`)

  /**
   * (Optional) Setting the configuration template
   */
  extension.config.setTemplate(DigikamGasketConfig)

  /**
   * Set up DigiKam DB connection
   */
  const opts: DataSourceOptions =
  (extension.config.getConfig().digikamDbType === 'MySQL')
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
    : { // Assume SQLite
        type: 'better-sqlite3',
        database: extension.config.getConfig().digikamSqliteDb,
        entities: [Album, Image]
      }
  const DigikamDataSource = new DataSource(opts)

  DigikamDataSource.initialize()
    .then(async () => {
      extension.Logger.debug('My extension has successfully connected to the DigiKam DB')
      // const albums = DigikamDataSource.getRepository(Album)
      // const publicAlbums = await albums.findBy({ collection: extension.config.getConfig().digikamShowCollection })
      // extension.Logger.silly('public albums: ', JSON.stringify(publicAlbums, undefined, 2))
    })
    .catch((err) => {
      extension.Logger.debug(`My extension encountered an error when connecting to the DigiKam DB: ${err}`)
    })

  /**
   * Only index directories tagged with the right collection
   */
  const baseQuery = (): SelectQueryBuilder<Album> => {
    const query = DigikamDataSource.getRepository(Album)
      .createQueryBuilder('album')
      .where('album.collection = :collection', { collection: extension.config.getConfig().digikamShowCollection })
    return query
  }
  const indexDir = async (dir: string): Promise<boolean> => {
    extension.Logger.silly(`indexDir:${dir}`)
    // https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md#adding-where-expression
    const count = await baseQuery()
      .andWhere(
        new Brackets((qb) => {
          qb.where('album.relativePath = :dir', { dir })
            .orWhere('album.relativePath LIKE :path', { path: `${dir}/%` })
        })
      )
      .getCount()
    extension.Logger.silly(`public album count:${count}`)
    return count > 0
  }
  const showDirPics = async (dir: string): Promise<boolean> => {
    extension.Logger.silly(`showDirPics:${dir}`)
    // https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md#adding-where-expression
    const count = await baseQuery()
      .andWhere('album.relativePath = :dir', { dir })
      .getCount()
    extension.Logger.silly(`public album count:${count}`)
    return count > 0
  }
  // https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/
  const asyncFilter = async (arr: any[], predicate: any): Promise<any[]> => {
    const results = await Promise.all(arr.map(predicate))

    return arr.filter((_v: boolean, index: number) => results[index])
  }
  extension.events.gallery.DiskManager
    .scanDirectory.after(async (output: ParentDirectoryDTO) => {
      // extension.Logger.silly('scanDirectory.after: ', JSON.stringify(output, undefined, 2));
      // FIXME: this would be better accomplished by having an extension hook into DiskManager.excludeDir, but this works.
      // https://www.aleksandrhovhannisyan.com/blog/async-functions-that-return-booleans/
      const dirs = await asyncFilter(output.directories, async (dir: any) => { const val = await indexDir(path.join(path.sep, dir.path, dir.name)); return val })
      output.directories = dirs
      // don't show any photos in this directory if it's not the right collection
      const showPics = await showDirPics(path.join(path.sep, output.path, output.name))
      if (!showPics) {
        output.media = []
      }
      // extension.Logger.silly('scanDirectory.after2: ', JSON.stringify(output, undefined, 2));
      return output
    })

  /**
   * Select covers specified in DigiKam (if present)
   * */
  extension.events.gallery.CoverManager
    .getCoverForDirectory.before(async (input: any, event) => { // FIXME: the input type is wrong?
      extension.Logger.silly('getCoverForDirectory.before: ', JSON.stringify(input, undefined, 2))
      const inputQuery = input.inputs[0]
      const albumPath = (inputQuery.path === './')
        ? path.join(path.sep, inputQuery.name)
        : path.join(path.sep, inputQuery.path, inputQuery.name)
      const albumInfo = await DigikamDataSource.getRepository(Album)
        .createQueryBuilder('album')
        .leftJoinAndSelect('album.icon', 'icon')
        .leftJoinAndSelect('icon.album', 'iconalbum')
        .where('album.relativepath = :path', { path: albumPath })
        .limit(1)
        .getOne()
      extension.Logger.silly('getCoverForDirectory.before2: ', JSON.stringify(albumInfo, undefined, 2))
      if (albumInfo.icon == null) {
        return input
      }
      const conn = await extension.db.getSQLConnection()
      const mediaEntity = (extension.db._getAllTables() as Array<typeof Entity>).find((entity: typeof Entity) => entity.name === 'MediaEntity')
      const coverMedia = await conn
        .getRepository(mediaEntity)
        .createQueryBuilder('media')
        .innerJoin('media.directory', 'directory')
        .select(['media.name', 'media.id', 'directory.name', 'directory.path'])
        .where('media.name = :mediaName', { mediaName: albumInfo.icon.name })
        .andWhere('directory.name = :dirName', { dirName: path.basename(albumInfo.icon.album.relativePath) })
        .andWhere('directory.path = :dirPath', { dirPath: path.join(path.dirname(albumInfo.icon.album.relativePath), path.sep).replace(/^\/+/, '') })
        .limit(1)
        .getOne()
      extension.Logger.silly('getCoverForDirectory.before3: ', util.inspect(coverMedia))
      if (coverMedia != null) {
        event.stopPropagation = true
        return coverMedia
      }
      return input
    })
}

export const cleanUp = async (extension: IExtensionObject<DigikamGasketConfig>): Promise<void> => {
  extension.Logger.debug('Cleaning up')
  // FIXME: probably need to reset digiKam data source
  /*
  * No need to clean up changed through extension.db,  extension.RESTApi or extension.events
  * */
}
