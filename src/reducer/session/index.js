export default function(state = null, action) {
  switch (action.type) {
    case 'sessionCreate':
      return {
        ...action.archive,
        search: '',
        page: 'tweets',
      }
    case 'sessionClose':
      return null
    case 'sessionSetSearch':
      return {
        ...state,
        search: action.search
      }
    case 'sessionSetPage':
      return {
        ...state,
        page: action.page
      }
    default:
      return state
  }
}
