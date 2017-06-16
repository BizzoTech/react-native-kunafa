import R from 'ramda';

const defaultState = {
	currentDialog: undefined
}

export default(state = defaultState, action) => {
	switch (action.type) {
		case 'OPEN_DIALOG':
			return action.dialog;
		case 'CLOSE_DIALOG':
		case 'RESET_HISTORY':
		case 'GO_TO':
		case 'NAVIGATE_TO':
		case 'TRANSITE_TO':
		case 'GO_BACK':
		case 'START_LOADING':
			return defaultState;
		default:
			return state
	}
}
