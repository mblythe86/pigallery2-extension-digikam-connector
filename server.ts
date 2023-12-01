/* eslint-disable @typescript-eslint/no-inferrable-types */

// Including dev-kit interfaces. It is not necessary, only helps development with types.
// You need to prefix them with ./node_modules
import { type IExtensionObject } from './node_modules/pigallery2-extension-kit'
import { type ILogger } from './node_modules/pigallery2-extension-kit/lib/backend/Logger'
import { type ParentDirectoryDTO } from './node_modules/pigallery2-extension-kit/lib/common/entities/DirectoryDTO'
import { Config } from './node_modules/pigallery2-extension-kit/lib/common/config/private/Config'
import { LogLevel } from './node_modules/pigallery2-extension-kit/lib/common/config/private/PrivateConfig'

// Importing packages that are available in the main app (listed in the packages.json in pigallery2)
import { DataSource, type DataSourceOptions, type SelectQueryBuilder, Entity, PrimaryGeneratedColumn, Column, Brackets, ManyToOne, OneToMany, JoinColumn, Relation } from 'typeorm'
import { SubConfigClass } from 'typeconfig/src/decorators/class/SubConfigClass'
import { ConfigProperty } from 'typeconfig/src/decorators/property/ConfigPropoerty'
import * as path from 'path'
import * as util from 'util'
const forcedDebug = process.env.NODE_ENV === 'debug'

const extensionLog = (() => {
  let realLog: ILogger = null

  return {
    setup: (extension: IExtensionObject<DigikamGasketConfig>): void => {
      if (realLog == null) {
        realLog = extension.Logger
      }
    },
    silly: (func: () => string): void => {
      if (!forcedDebug && Config.Server.Log.level < LogLevel.silly) {
        return
      }
      realLog.silly(func())
    },
    debug: (func: () => string): void => {
      if (!forcedDebug && Config.Server.Log.level < LogLevel.debug) {
        return
      }
      realLog.debug(func())
    },
    verbose: (func: () => string): void => {
      if (!forcedDebug && Config.Server.Log.level < LogLevel.verbose) {
        return
      }
      realLog.verbose(func())
    },
    info: (func: () => string): void => {
      if (!forcedDebug && Config.Server.Log.level < LogLevel.info) {
        return
      }
      realLog.info(func())
    },
    warn: (func: () => string): void => {
      if (!forcedDebug && Config.Server.Log.level < LogLevel.warn) {
        return
      }
      realLog.warn(func())
    },
    error: (func: () => string): void => {
      if (!forcedDebug && Config.Server.Log.level < LogLevel.error) {
        return
      }
      realLog.error(func())
    }
  }
})()
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
  @ConfigProperty({ description: 'DigiKam Directory Category' })
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

/**
 * Set up DigiKam DB connection
 */
const digikamDB = (() => {
  let instance: DataSource = null

  const createInstance = async (extension: IExtensionObject<DigikamGasketConfig>): Promise<DataSource> => {
    const commonOpts = {
      entities: [Album, Image],
      logging: (forcedDebug || Config.Server.Log.level >= LogLevel.debug)
    }
    const dbOpts = (() => {
      switch (extension.config.getConfig().digikamDbType) {
        case 'MySQL': return {
          type: 'mysql',
          host: extension.config.getConfig().digikamMysqlHost,
          port: extension.config.getConfig().digikamMysqlPort,
          database: extension.config.getConfig().digikamMysqlDb,
          username: extension.config.getConfig().digikamMysqlUser,
          password: extension.config.getConfig().digikamMysqlPassword
        }
        case 'SQLite': return {
          type: 'better-sqlite3',
          database: extension.config.getConfig().digikamSqliteDb
        }
        // FIXME: error out otherwise
      }
    })()
    const fullOpts = { ...commonOpts, ...dbOpts } as DataSourceOptions
    const DigikamDataSource = new DataSource(fullOpts)

    try {
      await DigikamDataSource.initialize()
      extensionLog.verbose(() => 'DigiKam Connector has successfully connected to the DigiKam DB')
    } catch (err) {
      extensionLog.error(() => `DigiKam Connector encountered an error when connecting to the DigiKam DB: ${err}`)
    }

    return DigikamDataSource
  }

  return {
    getDataSource: async (extension: IExtensionObject<DigikamGasketConfig>): Promise<DataSource> => {
      if (instance == null) {
        instance = await createInstance(extension)
      }
      return instance
    },
    cleanUp: async () => {
      if (instance != null) {
        await instance.destroy()
        instance = null
      }
    }
  }
})()

export const init = async (extension: IExtensionObject<DigikamGasketConfig>): Promise<void> => {
  extensionLog.setup(extension)
  extensionLog.info(() => `My extension is setting up. name: ${extension.extensionName}, id: ${extension.extensionId}`)

  /**
   * (Optional) Setting the configuration template
   */
  extension.config.setTemplate(DigikamGasketConfig)

  /**
   * Only index directories tagged with the right collection
   */
  const baseQuery = async (): Promise<SelectQueryBuilder<Album>> => {
    const ds = await digikamDB.getDataSource(extension)
    const query = ds.getRepository(Album)
      .createQueryBuilder('album')
      .where('album.collection = :collection', { collection: extension.config.getConfig().digikamShowCollection })
    return query
  }
  const indexDir = async (dir: string): Promise<boolean> => {
    extensionLog.silly(() => `indexDir:${dir}`)
    // https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md#adding-where-expression
    const q = await baseQuery()
    const count = await q
      .andWhere(
        new Brackets((qb) => {
          qb.where('album.relativePath = :dir', { dir })
            .orWhere('album.relativePath LIKE :path', { path: `${dir}/%` })
        })
      )
      .getCount()
    extensionLog.silly(() => `public album count:${count}`)
    return count > 0
  }
  const showDirPics = async (dir: string): Promise<boolean> => {
    extensionLog.silly(() => `showDirPics:${dir}`)
    // https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md#adding-where-expression
    const q = await baseQuery()
    const count = await q
      .andWhere('album.relativePath = :dir', { dir })
      .getCount()
    extensionLog.silly(() => `public album count:${count}`)
    return count > 0
  }
  // https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/
  const asyncFilter = async (arr: any[], predicate: any): Promise<any[]> => {
    const results = await Promise.all(arr.map(predicate))
    return arr.filter((_v: boolean, index: number) => results[index])
  }
  extension.events.gallery.DiskManager
    .scanDirectory.after(async (output: ParentDirectoryDTO) => {
      extensionLog.debug(() => `scanDirectory.after: output = ${util.inspect(output)}`)
      // FIXME: this would be better accomplished by having an extension hook into DiskManager.excludeDir, but this works.
      // https://www.aleksandrhovhannisyan.com/blog/async-functions-that-return-booleans/
      const dirs = await asyncFilter(output.directories, async (dir: any) => { const val = await indexDir(path.join(path.sep, dir.path, dir.name)); return val })
      output.directories = dirs

      // Also, don't show any photos in this directory if it's not the right collection
      const showPics = await showDirPics(path.join(path.sep, output.path, output.name))
      if (!showPics) {
        extensionLog.silly(() => 'Do not show pics in this directory!')
        output.media = []
      }
      extensionLog.debug(() => `scanDirectory.after: altered output = ${util.inspect(output)}`)
      return output
    })

  /**
   * Select covers specified in DigiKam (if present)
   * */
  extension.events.gallery.CoverManager
    .getCoverForDirectory.before(async (input: any, event) => { // FIXME: the input type is wrong?
      extensionLog.debug(() => `getCoverForDirectory.before: input = ${util.inspect(input)}`)
      const inputQuery = input.inputs[0]
      const albumPath = (inputQuery.path === './')
        ? path.join(path.sep, inputQuery.name)
        : path.join(path.sep, inputQuery.path, inputQuery.name)
      const ds = await digikamDB.getDataSource(extension)
      const albumInfo = await ds.getRepository(Album)
        .createQueryBuilder('album')
        .leftJoinAndSelect('album.icon', 'icon')
        .leftJoinAndSelect('icon.album', 'iconalbum')
        .where('album.relativepath = :path', { path: albumPath })
        .limit(1)
        .getOne()
      extensionLog.debug(() => `getCoverForDirectory.before: albumInfo = ${util.inspect(albumInfo)}`)
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
        .andWhere('directory.path = :dirPath', { dirPath: path.join(path.relative('/', path.dirname(albumInfo.icon.album.relativePath)), path.sep) })
        .limit(1)
        .getOne()
      extensionLog.debug(() => `getCoverForDirectory.before: coverMedia = ${util.inspect(coverMedia)}`)
      if (coverMedia != null) {
        event.stopPropagation = true
        return coverMedia
      }
      return input
    })
}

export const cleanUp = async (extension: IExtensionObject<DigikamGasketConfig>): Promise<void> => {
  extension.Logger.debug('Cleaning up')
  await digikamDB.cleanUp()
  /*
  * No need to clean up changed through extension.db,  extension.RESTApi or extension.events
  * */
}
