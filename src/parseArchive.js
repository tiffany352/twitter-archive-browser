import JSZip from "jszip"
const electron = window.require('electron')
const fs = electron.remote.require('fs')

function loadFile(root, name) {
  const path = root + '/' + name

  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, rawData) => {
      if (err) {
        reject(err)
        return
      }

      resolve(rawData)
    })
  })
}

async function loadDataFile(root, name) {
  try {
    const rawData = await loadFile(root, name + '.js')

    const string = new TextDecoder('utf-8').decode(rawData)

    const pattern = /^[^=]+ = (.*)$/ms
    const rest = pattern.exec(string)[1]
    const data = JSON.parse(rest)

    return (data[0] && data[0][name]) || data
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      return null
    }
    else {
      throw e;
    }
  }
}

class MediaProvider {
  constructor(zipFile) {
    this.zipFile = zipFile
  }

  async getMediaUrl(tweetId, cdnUrl) {
    if (!this.zipFile) {
      return null
    }

    // https://pbs.twimg.com/media/ABCDEFGHJKLMNOP.png
    const pattern = /^https:\/\/pbs\.twimg\.com\/media\/(.*)\.(.*)$/
    const result = cdnUrl.match(pattern)
    if (!result) {
      console.log('failed to parse: ', cdnUrl)
      return null
    }
    const [, cdnName, cdnExt ] = result
    let mimeType
    switch (cdnExt) {
      case 'png':
        mimeType = 'image/png'
        break
      case 'jpg':
        mimeType = 'image/jpeg'
        break
      default:
        console.log('unknown extension:', cdnExt)
        return null
    }

    const fileName = tweetId + '-' + cdnName + '.' + cdnExt
    const file = this.zipFile.file(fileName)
    const contents = await file.async("binarystring")
    const contentsBase64 = btoa(contents)

    return 'data:' + mimeType + ';base64,' + contentsBase64
  }

  async getVideoUrl(tweetId, cdnUrl) {
    if (!this.zipFile) {
      return null
    }

    // https://video.twimg.com/ext_tw_video/{tweet id}/pu/vid/624x1230/{filename}.mp4?tag=10
    const pattern = /^https:\/\/video\.twimg\.com\/ext_tw_video\/.*\/pu\/vid\/.*\/(.*)\.([^?]+)(?:\?.*)?$/
    const result = cdnUrl.match(pattern)
    if (!result) {
      console.log('failed to parse: ', cdnUrl)
      return null
    }
    const [, cdnName, cdnExt ] = result
    let mimeType
    switch (cdnExt) {
      case 'mp4':
        mimeType = 'video/mp4'
        break
      default:
        console.log('unknown extension:', cdnExt)
        return null
    }

    const fileName = tweetId + '-' + cdnName + '.' + cdnExt
    const file = this.zipFile.file(fileName)
    const contents = await file.async("binarystring")
    const contentsBase64 = btoa(contents)
    console.log('getVideoUrl', {
      tweetId, cdnUrl, fileName, mimeType
    })

    return 'data:' + mimeType + ';base64,' + contentsBase64
  }

  async getGifUrl(tweetId, cdnUrl) {
    if (!this.zipFile) {
      return null
    }

    // "https://video.twimg.com/tweet_video/{filename}.mp4"
    const pattern = /^https:\/\/video\.twimg\.com\/tweet_video\/(.*)$/
    const result = cdnUrl.match(pattern)
    if (!result) {
      console.log('failed to parse: ', cdnUrl)
      return null
    }
    const [, cdnName ] = result

    const fileName = tweetId + '-' + cdnName
    const file = this.zipFile.file(fileName)
    const contents = await file.async("binarystring")
    const contentsBase64 = btoa(contents)
    console.log('getGifUrl', {
      tweetId, cdnUrl, fileName
    })

    return 'data:video/mp4;base64,' + contentsBase64
  }
}

async function loadMedia(root) {
  try {
    const zipData = await loadFile(root, 'tweet_media/tweet-media-part1.zip')
    const zipFile = await JSZip.loadAsync(zipData)

    return new MediaProvider(zipFile)
  }
  catch (e) {
    return new MediaProvider(null)
  }
}

export class ArchiveLoadError extends Error {
  constructor(path, archiveType, reason, missingFiles) {
    super("ArchiveLoadError: " + reason)
    this.path = path
    this.archiveType = archiveType
    this.reason = reason
    this.missingFiles = missingFiles
  }
}

export default async function parseArchive(path) {
  const dataFiles = [
    'account',
    'account-creation-ip',
    'account-suspension',
    'ad-engagements',
    'ad-impressions',
    'ad-mobile-conversions-attributed',
    'ad-mobile-conversions-unattributed',
    'ad-online-conversions-attributed',
    'ad-online-conversions-unattributed',
    'ageinfo',
    'block',
    'connected-application',
    'contact',
    'direct-message',
    'direct-message-headers',
    'direct-message-group',
    'email-address-change',
    'follower',
    'following',
    'ip-audit',
    'like',
    'lists-created',
    'lists-member',
    'lists-subscribed',
    'moment',
    'mute',
    'ni-devices',
    'personalization',
    'profile',
    'protected-history',
    'saved-search',
    'screen-name-change',
    'tweet',
    'verified',
  ]

  const stats = await new Promise((resolve, reject) => {
    fs.lstat(path, (err, stats) => {
      if (err) {
        reject(err)
      }
      else {
        resolve(stats)
      }
    })
  })

  const list = await Promise.all(dataFiles.map(async (name) => {
    return {
      name,
      data: await loadDataFile(path, name)
    }
  }))

  const map = {}
  for (let entry of list) {
    map[entry.name] = entry.data
  }

  if (map.tweet) {
    for (let tweet of map.tweet) {
      tweet.created_date = new Date(tweet.created_at)
    }

    map.tweet.sort((a, b) => {
      return b.created_date - a.created_date
    })

    // Cross reference screen name data
    const screenNames = {}

    for (const tweet of map.tweet) {
      if (tweet.in_reply_to_user_id && tweet.in_reply_to_screen_name) {
        screenNames[tweet.in_reply_to_user_id] = tweet.in_reply_to_screen_name
      }
      if (tweet.entities.user_mentions) {
        for (const mention of tweet.entities.user_mentions) {
          if (mention.id_str && mention.screen_name) {
            screenNames[mention.id_str] = mention.screen_name
          }
        }
      }
    }

    map.screen_names = screenNames
  }

  map.tweet_media = await loadMedia(path)

  if (!map.account || !map.tweet) {
    const missingFiles = []
    for (const file of dataFiles) {
      if (map[file] === null) {
        missingFiles.push(file + '.js')
      }
    }
    throw new ArchiveLoadError(
      path,
      stats.isDirectory() ? 'Folder' : 'Zip File',
      'Critical files missing',
      missingFiles
    )
  }

  console.log('archive data', map)

  return map
}
