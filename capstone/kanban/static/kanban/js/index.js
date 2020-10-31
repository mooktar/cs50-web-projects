document.addEventListener('DOMContentLoaded', function () {

    console.log('JS is working!')

    // Tabs functionality
    const triggerTabList = selectorAll('.nav-pills a');
    triggerTabList.forEach((triggerEl) => {
        const tabTrigger = new bootstrap.Tab(triggerEl)
        triggerEl.addEventListener('click', (e) => {
            e.preventDefault()
            tabTrigger.show()
        })
    })

}, false);


// Select item(s)
function selector(el) {
    return document.querySelector(el)
}
function selectorAll(els) {
    return document.querySelectorAll(els)
}


// Notifify
function notify(message) {
    $('#toast-notification').toast('show')
    selector('.toast-notification-body').innerHTML = message
}

// Drag and drop Function
function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.dataset.card);
    selectorAll('.card-empty').forEach(ce => {
        console.log("Card", ce)
        ce.style.display = 'none'
    })
}
function drop(ev) {
    ev.preventDefault();
    var card_id = ev.dataTransfer.getData("text");
    ev.target.appendChild(selector(`#card-item-${card_id}`));
    console.log(card_id, ':', ev.target)

    fetch(`/cards/${card_id}/drop`, {
        method: 'POST',
        body: JSON.stringify({
            'board_id': ev.target.dataset.board,
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log('Dropping:', data)
        })
        .catch(err => console.log('Dropping:', err));
}