export default function(state = null, action) {
  switch (action.type) {
    case 'sessionCreate':
      return {
        ...action.archive
      }
    case 'sessionClose':
      return null
    case 'sessionSetSearch':
      return {
        ...state,
        search: action.search
      }
    default:
      return state
  }
}
