
const mimeTypes = {
  png: 'image/png',
  jpg: 'image/jpeg',
  mp4: 'video/mp4',
}

export default class MediaProvider {
  constructor(tree) {
    this.tree = tree
  }

  lookup(pattern, tweetId, url) {
    if (!this.tree) {
      // Use actual cdn if local media isn't available
      return url
    }

    const result = url.match(pattern)
    if (!result) {
      console.log('failed to parse: ', url)
      return null
    }

    const [, originalName, extension ] = result

    const filename = `${tweetId}-${originalName}.${extension}`
    return filename
  }

  getMediaUrl(tweetId, cdnUrl) {
    // https://pbs.twimg.com/media/ABCDEFGHJKLMNOP.png
    const pattern = /^https:\/\/pbs\.twimg\.com\/media\/(.*)\.(.*)$/
    return this.lookup(pattern, tweetId, cdnUrl)
  }

  getVideoUrl(tweetId, cdnUrl) {
    // https://video.twimg.com/ext_tw_video/{tweet id}/pu/vid/624x1230/{filename}.mp4?tag=10
    const pattern = /^https:\/\/video\.twimg\.com\/ext_tw_video\/.*\/pu\/vid\/.*\/(.*)\.([^?]+)(?:\?.*)?$/
    return this.lookup(pattern, tweetId, cdnUrl)
  }

  getGifUrl(tweetId, cdnUrl) {
    // "https://video.twimg.com/tweet_video/{filename}.mp4"
    const pattern = /^https:\/\/video\.twimg\.com\/tweet_video\/(.*)\.(.*)$/
    return this.lookup(pattern, tweetId, cdnUrl)
  }

  getDirectMessageMediaUrl(cdnUrl) {
    if (!this.tree) {
      return null
    }

    // "https://ton.twitter.com/dm/{media id part 1}/{junk}/{media id part 2}.jpg"
    const pattern = /^https:\/\/ton\.twitter\.com\/dm\/(.*)\/.*\/(.*)\.(.*)$/

    const result = cdnUrl.match(pattern)
    if (!result) {
      console.log('failed to parse: ', cdnUrl)
      return null
    }

    const [, name1, name2, extension ] = result
    const mimeType = mimeTypes[extension]
    if (!mimeType) {
      console.log('unknown extension:', extension)
      return null
    }

    const filename = `${name1}-${name2}.${extension}`
    return filename
  }

  async fetchMedia(filename) {
    const extension = filename.match(/^.*\.(.*)$/)[1]
    const mimeType = mimeTypes[extension]
    if (!mimeType) {
      console.log('unknown extension:', extension)
      return null
    }

    const contents = await this.tree.readBase64(filename)
    if (!contents) {
      return null
    }
    return 'data:' + mimeType + ';base64,' + contents
  }
}
