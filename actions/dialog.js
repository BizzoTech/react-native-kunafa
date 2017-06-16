export const openDialog = (dialog) => {
  return {
    type: 'OPEN_DIALOG',
    dialog
  }
}

export const closeDialog = () => {
  return {
    type: 'CLOSE_DIALOG'
  }
}
