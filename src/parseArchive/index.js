import MediaProvider from './MediaProvider'
import FileTree from './FileTree'

export class ArchiveLoadError extends Error {
  constructor(path, archiveType, reason, missingFiles) {
    super("ArchiveLoadError: " + reason)
    this.path = path
    this.archiveType = archiveType
    this.reason = reason
    this.missingFiles = missingFiles
  }
}

function parseDate(date) {
  const isUnix = /^([0-9]+)$/.test(date)
  return new Date(
    isUnix ? parseInt(date) : date
  )
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

  const tree = await FileTree.open(path)

  const list = await Promise.all(dataFiles.map(async (name) => {
    return {
      name,
      data: await tree.readTwitterJson(name + '.js')
    }
  }))

  const map = {}
  for (let entry of list) {
    map[entry.name] = (entry.data && entry.data.length === 1 && entry.data[0][entry.name]) || entry.data
  }

  if (map.tweet) {
    map.tweet = map.tweet.map((data) => data.tweet || data)
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

  if (map.account) {
    map.account.createdDate = parseDate(map.account.createdAt)
  }

  if (map['direct-message']) {
    map.direct_message = map['direct-message'].map((conversation) => {
      conversation = conversation.dmConversation
      return {
        conversationId: conversation.conversationId,
        messages: conversation.messages.map((message) => {
          message = message.messageCreate
          message.createdDate = parseDate(message.createdAt)

          return message  
        })
      }
    })
  }

  map.tweet_media = new MediaProvider(await tree.readZip('tweet_media/tweet-media-part1.zip') || tree.readDir('tweet_media'))
  map.direct_message_media = new MediaProvider(await tree.readZip(
    'direct_message_media/direct-message-media-part1.zip'
  ) || tree.readDir('direct_message_media'))

  if (!map.account || !map.tweet) {
    const missingFiles = []
    for (const file of dataFiles) {
      if (map[file] === null) {
        missingFiles.push(file + '.js')
      }
    }
    throw new ArchiveLoadError(
      path,
      tree.type,
      'Critical files missing',
      missingFiles
    )
  }

  console.log('archive data', map)

  return map
}
