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
  const rawData = await loadFile(root, name + '.js')
  
  const string = new TextDecoder('utf-8').decode(rawData)

  const pattern = /^[^=]+ = (.*)$/ms
  const rest = pattern.exec(string)[1]
  const decoded = JSON.parse(rest)

  return decoded
}

class MediaProvider {
  constructor(zipFile) {
    this.zipFile = zipFile
  }

  async getMediaUrl(tweetId, cdnUrl) {
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
}

async function loadMedia(root) {
  const zipData = await loadFile(root, 'tweet_media/tweet-media-part1.zip')
  const zipFile = await JSZip.loadAsync(zipData)

  return new MediaProvider(zipFile)
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

  const list = await Promise.all(dataFiles.map(async (name) => {
    return {
      name,
      data: await loadDataFile(path, name)
    }
  }))

  const map = {}
  for (let entry of list) {
    console.log(entry)
    map[entry.name] = (entry.data[0] && entry.data[0][entry.name]) || entry.data
  }

  for (let tweet of map.tweet) {
    tweet.created_date = new Date(tweet.created_at)
  }

  map.tweet.sort((a, b) => {
    return b.created_date - a.created_date
  })

  map.tweet_media = await loadMedia(path)

  return map
}
