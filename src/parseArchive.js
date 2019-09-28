const electron = window.require('electron')
const fs = electron.remote.require('fs')

function loadFile(root, name) {
  const path = root + '/' + name + '.js'

  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, rawData) => {
      if (err) {
        reject(err)
        return
      }
  
      const string = new TextDecoder('utf-8').decode(rawData)
  
      const pattern = /^[^=]+ = (.*)$/ms
      const rest = pattern.exec(string)[1]
      const decoded = JSON.parse(rest)
  
      resolve(decoded)
    })
  })
}

export default async function parseArchive(path) {
  const files = [
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

  const list = await Promise.all(files.map(async (name) => {
    return {
      name,
      data: await loadFile(path, name)
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

  return map
}
