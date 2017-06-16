const defaultState = {
	isProcessing: false
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case 'START_PROCESSING_LOCAL':
      return {
				isProcessing: true,
				progress: action.progress
			};
    case 'END_PROCESSING_LOCAL':
      return defaultState
    default:
      return state
  }
}
