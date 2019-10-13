
const mimeTypes = {
  png: 'image/png',
  jpg: 'image/jpeg',
  mp4: 'video/mp4',
}

export default class MediaProvider {
  constructor(tree) {
    this.tree = tree
  }

  async lookup(pattern, tweetId, url) {
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
    const mimeType = mimeTypes[extension]
    if (!mimeType) {
      console.log('unknown extension:', extension)
      return null
    }

    const filename = `${tweetId}-${originalName}.${extension}`
    const contents = await this.tree.readBase64(filename)

    return 'data:' + mimeType + ';base64,' + contents

  }

  async getMediaUrl(tweetId, cdnUrl) {
    // https://pbs.twimg.com/media/ABCDEFGHJKLMNOP.png
    const pattern = /^https:\/\/pbs\.twimg\.com\/media\/(.*)\.(.*)$/
    return await this.lookup(pattern, tweetId, cdnUrl)
  }

  async getVideoUrl(tweetId, cdnUrl) {
    // https://video.twimg.com/ext_tw_video/{tweet id}/pu/vid/624x1230/{filename}.mp4?tag=10
    const pattern = /^https:\/\/video\.twimg\.com\/ext_tw_video\/.*\/pu\/vid\/.*\/(.*)\.([^?]+)(?:\?.*)?$/
    return await this.lookup(pattern, tweetId, cdnUrl)
  }

  async getGifUrl(tweetId, cdnUrl) {
    // "https://video.twimg.com/tweet_video/{filename}.mp4"
    const pattern = /^https:\/\/video\.twimg\.com\/tweet_video\/(.*)\.(.*)$/
    return await this.lookup(pattern, tweetId, cdnUrl)
  }
}
