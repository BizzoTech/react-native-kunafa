export const resetHistory = () => {
	return {
		type: 'RESET_HISTORY'
	}
}

export const navigateTo = (routeName, params) => {
  return {
    type: 'NAVIGATE_TO',
    route: {
      name: routeName,
      params
    }
  }
}

export const transiteTo = (routeName, params) => {
  return {
    type: 'TRANSITE_TO',
    route: {
      name: routeName,
      params
    }
  }
}

export const goBack = () => {
  return {
    type: 'GO_BACK'
  }
}

export const goTo = (routeName, params) => {
  return {
    type: 'GO_TO',
    route: {
      name: routeName,
      params
    }
  }
}
