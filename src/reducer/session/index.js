export default function(state = null, action) {
  switch (action.type) {
    case 'sessionCreate':
      return {
        ...action.archive
      }
    case 'sessionClose':
      return null
    default:
      return state
  }
}
