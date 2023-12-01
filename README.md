# DigiKam Connector for Pigallery2

Pigallery 2 extension to integrate with an existing DigiKam-managed photo collection.

## Features

* Supports both SQLite and MySQL DigiKam databases (testing primarily done with MySQL)
* Pigallery2 only indexes and displays directories with a specific DigiKam category (default 'Public')
* Pigallery2 uses directory thumbnails selected in DigiKam
* (TODO) Pigallery2 displays directory-level comments added in DigiKam

## Assumptions

* Pigallery2 and DigiKam use the same directory as the 'root' of the photo collection

## Installation & Setup

1. `git clone` this repo
2. Add a volume to your docker container to put the repo at `/app/data/config/extensions/digikam-connector`
3. Start up Pigallery2
4. On the 'Settings/Admin' page, in the 'Extensions' section, add your DigiKam DB details, and save the settings.
   * For now, this is a JSON string.  Hopefully, it will be a nicely-formatted form in the future
5. Restart Pigallery2 to load the extension settings
   * Hopefully in the future, saving the settings will cause the extension to re-load
6. Kick off a full re-index

## Development

```
npm install
npm run fix-format
npm run build
```

