export default (value) => {
    const date = new Date(vaule)
    return date.toLocaleString(['en-US'], {month: 'short', day: '2-digit', year: 'numeric', hour: '2-dight', minute: '2-digit'})
}