
// Select item(s)
function selector(el) {
    return document.querySelector(el)
}
function selectorAll(els) {
    return document.querySelectorAll(els)
}

// Notifify
function notify(alert, message) {
    const item = document.createElement('div')
    item.classList = 'row'
    item.style.transition = `all 0.5s ease-in-out`

    const item_container = document.createElement('div')
    item_container.classList = 'col-md-9 ml-auto mr-auto'
    
    const item_alert = document.createElement('div')
    if (alert == true) {
        item_alert.classList = 'alert alert-success alert-dismissible fade show p-1'
    } else if (alert == false) {
        item_alert.classList = 'alert alert-danger alert-dismissible fade show p-1'
    }
    item_alert.setAttribute('role', 'alert')
    item_alert.innerHTML = message
    
    item_container.append(item_alert)
    item.append(item_container)
    selector('.notification').append(item)

    setTimeout(() => {
        // selector('.notification').innerHTML = ''
        selector('.notification .row').style.display = 'none'
    }, 5000)
}

// Format / reformate date picker
function formateDate (date) {
    let dt = new Date(date)
    return dt.toLocaleDateString()
}
function reformateDate(date) {
    let dtr = new Date(date)
    return `${dtr.getFullYear()}-${dtr.getMonth() + 1}-${dtr.getDate()}`
}
