export default class Segmenter {
  constructor(length, defaultValue = null) {
    this.length = length
    this.array = [
      { start: 0, end: length - 1, value: defaultValue }
    ]
  }

  setSpan(start, end, value) {
    if (end < start) {
      return
    }
    const newArray = []

    // edge cases:
    // old: AAAAAABBBBB
    // new:    CCCCCC
    // old: AAAAAAAAAAA
    // new:     CCC
    // old: AAAAAAAAAAA
    // new:        CCCC
    // old: AAAAAAAAAAA
    // new: CCCCAAAAAAA

    const insert = (entry) => {
      if (entry.end >= entry.start) {
        newArray.push(entry)
      }
    }

    for (const entry of this.array) {
      if (entry.start < start) {
        insert({
          ...entry,
          end: Math.min(entry.end, start - 1),
        })
      }
      else {
        break
      }
    }

    newArray.push({
      start, end, value
    })

    for (const entry of this.array) {
      if (entry.end > start) {
        insert({
          ...entry,
          start: Math.max(entry.start, end + 1),
        })
      }
    }

    this.array = newArray
  }
}
