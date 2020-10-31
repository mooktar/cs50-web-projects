document.addEventListener('DOMContentLoaded', function () {

    var myProjectModal = new bootstrap.Modal(selector('#modal-project'), {})
    var myBoardModal = new bootstrap.Modal(selector('#modal-board'), {})
    var myCardModal = new bootstrap.Modal(selector('#modal-card'), {})

    // Edit project
    selector('#btn-edit-project').onclick = (e) => {
        e.preventDefault()
        myProjectModal.show()
        selector('.modal-project-title').innerHTML = 'Edit project'
        selector('#form-project-submit').innerHTML = 'Save'
        selector('.tab-project-details').classList.add('active')
        selector('.tab-project-members').classList.remove('active')
        selector('#pane-project-details').classList.add('active')
        selector('#pane-project-members').classList.remove('active')
        selector('#form-project').onsubmit = (e) => {
            e.preventDefault()
            const project_id = selector('#form-project-submit')

            fetch(`/projects/${project_id.dataset.project}/edit`, {
                method: 'POST',
                body: JSON.stringify({
                    title: selector('#form-project-title').value,
                    description: selector('#form-project-description').value,
                    due_date: selector('#form-project-due-date').value,
                })
            })
                .then(res => res.json())
                .then(data => {
                    myProjectModal.hide()
                    selector('.project-data-title').innerText = data.title
                })
                .catch(err => console.log('Edit project:', err))
                
            return false
        }

    }

    // Manage member from a project
    selector('#btn-manage-members').onclick = (e) => {
        e.preventDefault()
        myProjectModal.show()
        selector('.modal-project-title').innerHTML = 'Edit project'
        selector('#form-project-submit').innerHTML = 'Save'
        selector('.tab-project-details').classList.remove('active')
        selector('.tab-project-members').classList.add('active')
        selector('#pane-project-details').classList.remove('active')
        selector('#pane-project-members').classList.add('active')
        selectorAll('.btn-add-member').forEach(btn => {
            btn.onclick = function(e) {
                e.preventDefault()
                fetch(`/projects/${btn.dataset.project}/members`, {
                    method: 'POST',
                    body: JSON.stringify({
                        member: btn.dataset.member,
                        action: btn.innerText,
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        btn.innerHTML = data.action
                        if (data.action == 'add') {
                            btn.classList.remove('btn-danger')
                            btn.classList.add('btn-primary')
                        } else {
                            btn.classList.remove('btn-primary')
                            btn.classList.add('btn-danger')
                        }
                    })
                    .catch(err => console.log('Error:', err))
            }
        });
    }

    // Complete project
    selector('#btn-complete-project').onclick = () => {
        var btn = selector('#btn-complete-project')
        fetch(`/projects/${btn.dataset.projectid}/complete`, {
            method: 'POST',
            body: JSON.stringify({'text':btn.innerText})
        })
        .then(res => res.json())
        .then(data => {
            btn.innerHTML = data.text
            notify(data.message)
        })
        .catch(err => console.log('Complete:', err))
    }

    // New board
    selector('#btn-new-board').onclick = () => {
        myBoardModal.show()
        selector('.modal-board-title').innerHTML = 'New board'
        selector('#form-board-name').setAttribute('value', '')
        selector('#form-board-submit').innerHTML = 'Create'
        selector('#form-board').onsubmit = (e) => {
            e.preventDefault()
            const project_id = selector('#form-board').dataset.project
            fetch(`/projects/${project_id}/boards/add`, {
                method: 'POST',
                body: JSON.stringify({
                    'name': selector('#form-board-name').value
                })
            })
                .then(res => res.json())
                .then(data => {
                    myBoardModal.hide()
                    selector('#no-boards').style.display = 'none'
                    render_board(data)
                    notify(data.message)
                })
                .catch(err => console.log('New board', err));

            selector('#form-board-name').value = ''
            return false
        }
    }
    
    // Edit board
    selectorAll('.btn-edit-board').forEach(btn => {
        btn.onclick = (ev) => {
            ev.preventDefault()
            myBoardModal.show()
            selector('.modal-board-title').innerHTML = 'Change title'
            selector('#form-board-name').setAttribute('value', `${btn.dataset.name}`)
            selector('#form-board-submit').innerHTML = 'Save'
            selector('#form-board').onsubmit = (e) => {
                e.preventDefault()
                fetch(`/boards/${btn.dataset.board}/edit`, {
                    method: 'POST',
                    body: JSON.stringify({
                        'name': selector('#form-board-name').value
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        myBoardModal.hide()
                        notify(data.message)
                        selector(`.board-${btn.dataset.board}-name`).innerText = data.name
                    })
                    .catch(err => console.log('Edit board', err));
    
                return false
            }
            
        }
    })

    // New card
    selectorAll('.btn-new-card').forEach(btn =>{
        btn.onclick = (ev) => {
            ev.preventDefault()
            myCardModal.show()
            selector('.modal-card-title').innerHTML = 'New card'
            selector('#form-card-name').setAttribute('value', '')
            selector('#form-card-description').innerHTML = ''
            selector('#form-card-submit').innerHTML = 'Create'
            selector('#form-card-action').style.display = 'none'
            selector('.tab-card-tasks').classList.add('disabled')
            selector('.tab-card-details').classList.add('active')
            selector('.tab-card-tasks').classList.remove('active')
            selector('#pane-card-details').classList.add('active')
            selector('#pane-card-tasks').classList.remove('active')
            selector('#form-card').onsubmit = (e) => {
                e.preventDefault()
                fetch(`/boards/${btn.dataset.board}/cards/add`, {
                    method: 'POST',
                    body: JSON.stringify({
                        'name': selector('#form-card-name').value,
                        'description': selector('#form-card-description').value
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        myCardModal.hide()
                        selector('.card-empty').style.display = 'none'
                        notify(data.message)
                        render_card(data, btn.dataset.board)
                    })
                    .catch(err => console.log('New card', err));
            
                selector('#form-card-name').value = ''
                selector('#form-card-description').value = ''
                return false
            }
        }
    })
    
    // Edit card
    selectorAll('.btn-edit-card').forEach(btn => {
        btn.onclick = (ev) => {
            ev.preventDefault()
            myCardModal.show()
            const card_id = btn.dataset.card
            var card_name = selector(`.card-item-${card_id}-name`).innerText
            var card_description = selector(`.card-item-${card_id}-description`).innerText
            selector('.modal-card-title').innerHTML = 'Edit card'
            selector('#form-card-name').setAttribute('value', `${card_name}`)
            selector('#form-card-description').innerHTML = `${card_description}`
            selector('#form-card-submit').innerHTML = 'Save'
            selector('#form-card-action').style.display = ''
            selector('#form-card-delete').setAttribute('href', `/cards/${card_id}/delete`)
            selector('.tab-card-tasks').classList.remove('disabled')
            selector('#form-task-body').setAttribute('value', '')
            selector('.tab-card-details').classList.remove('active')
            selector('.tab-card-tasks').classList.add('active')
            selector('#pane-card-details').classList.remove('active')
            selector('#pane-card-tasks').classList.add('active')

            // Upload tasks for this card
            fetch(`/cards/${card_id}/tasks`)
                .then(res => res.json())
                .then(data => {
                    selector('#modal-tasks').innerHTML = ''
                    for (let i = 0; i < data.tasks.length; i++) {
                        task = data.tasks[i]
                        if (task.card_id == card_id) { render_task(task) }
                        selector('#form-task input').innerHTML = ''
                    }
                })
                .catch(err => console.log('All tasks', err));
            
            // Update card contents
            selector('#form-card').onsubmit = (e) => {
                e.preventDefault()
                fetch(`/cards/${card_id}/edit`, {
                    method: 'POST',
                    body: JSON.stringify({
                        'name': selector('#form-card-name').value,
                        'description': selector('#form-card-description').value
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        myCardModal.hide()
                        notify(data.message)
                        selector(`.card-item-${data.id}-name`).innerHTML = data.name
                        selector(`.card-item-${data.id}-description`).innerHTML = data.description
                    })
                    .catch(err => console.log('Edit card', err));
                    
                return false
            }
            
            // Add new task
            selector('#form-task').onsubmit = (e) => {
                e.preventDefault()
                fetch(`/cards/${card_id}/tasks/add`, {
                    method: 'POST',
                    body: JSON.stringify({
                        'body': selector('#form-task-body').value
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        render_task(data)
                        const count = selector(`.tasks-${card_id}-all`)
                        count.innerHTML = parseInt(count.innerText) + 1
                    })
                    .catch(err => console.log('New task', err));
    
                selector('#form-task-body').value = ''
                return false
            }
    
        }
    })

}, false);


function render_board(data) {
    const item = document.createElement('div')
    item.classList = 'col-lg-3 col-md-4 col-sm-6 col-12 board'
    
    const item_container = document.createElement('div')
    item_container.classList = 'card'

    const item_header = document.createElement('div')
    item_header.classList = 'card-header'
    item_header.innerHTML = `<span class="board-title">${data.name}</span>`

    const item_dropdown = document.createElement('span')
    item_dropdown.classList = 'dropdown'

    const item_dropdown_toogle = document.createElement('a')
    item_dropdown_toogle.classList = 'dropdown-toggle'
    item_dropdown_toogle.setAttribute('data-toggle', 'dropdown')
    item_dropdown_toogle.setAttribute('aria-haspopup', 'true')
    item_dropdown_toogle.setAttribute('aria-expanded', 'false')

    const item_dropdown_menu = document.createElement('div')
    item_dropdown_menu.classList = 'dropdown-menu dropdown-menu-right py-0'

    const item_dropdown_btn_edit = document.createElement('a')
    item_dropdown_btn_edit.classList = 'dropdown-item btn-edit-board'
    item_dropdown_btn_edit.setAttribute('data-board', `${data.id}`)
    item_dropdown_btn_edit.setAttribute('data-name', `${data.name}`)
    item_dropdown_btn_edit.innerHTML = 'Edit'

    const item_dropdown_btn_del = document.createElement('a')
    item_dropdown_btn_del.classList = 'dropdown-item text-danger'
    item_dropdown_btn_del.setAttribute('id', 'form-board-delete')
    item_dropdown_btn_del.setAttribute('href', `/boards/${data.name}/delete`)
    item_dropdown_btn_del.innerHTML = 'Delete'

    item_dropdown_menu.append(item_dropdown_btn_edit, item_dropdown_btn_del)
    item_dropdown.append(item_dropdown_toogle, item_dropdown_menu)
    item_header.append(item_dropdown)

    const item_body = document.createElement('div')
    item_body.classList = 'card-body bg-light'
    item_body.setAttribute('id', `board-body-${data.id}`)
    item_body.setAttribute('data-board', `${data.id}`)
    item_body.setAttribute('ondrop', 'drop(event)')
    item_body.setAttribute('ondragover', 'allowDrop(event)')

    const item_body_p = document.createElement('p')
    item_body_p.classList = 'card-empty text-muted text-center m-0'
    item_body_p.innerHTML = 'No cards yet.'
    
    item_body.append(item_body_p)
    
    const item_footer = document.createElement('div')
    item_footer.classList = 'card-footer'
    
    const item_btn_new_card = document.createElement('a')
    item_btn_new_card.classList = 'btn-new-card'
    item_btn_new_card.setAttribute('data-board', `${data.id}`)
    item_btn_new_card.innerHTML = 'Add new card'

    item_footer.append(item_btn_new_card)
    
    item_container.append(item_header, item_body, item_footer)
    item.append(item_container)
    selector('#boards-list').append(item)
}

function render_card(data, board_id) {
    const item = document.createElement('div')
    item.classList = 'card card-body card-item my-1'
    item.setAttribute('id', `card-item-${data.id}`)
    item.setAttribute('data-card', `${data.id}`)
    item.setAttribute('draggable', true)
    item.setAttribute('ondragstart', 'drag(event)')
    
    const item_name = document.createElement('span')
    item_name.classList = `card-item-${data.id}-name`
    item_name.innerHTML = data.name
    
    const item_description = document.createElement('span')
    item_description.classList = `card-item-${data.id}-description`
    item_description.style.display = 'none'
    item_description.innerHTML = data.description



    const item_btn_edit = document.createElement('a')
    item_btn_edit.classList = 'btn-edit-card'
    item_btn_edit.setAttribute('data-board', `${board_id}`)
    item_btn_edit.setAttribute('data-card', `${data.id}`)

    const item_btn_icon = document.createElement('img')
    item_btn_icon.classList = 'img-fluid'
    item_btn_icon.src = `{% static 'kanban/icons/list-check.svg' %}`
    
    const item_tasks = document.createElement('small')
    item_tasks.classList = `card-item-${data.id}-tasks`
    item_tasks.innerHTML = '0/0'
    
    item_btn_edit.append(item_btn_icon, item_tasks)
    item.append(item_name, item_description, item_btn_edit)
    selector(`#board-body-${board_id}`).append(item)
}

function render_task(data) {
    const item = document.createElement('label')
    item.setAttribute('id', `modal-task-${data.id}`)
    item.classList = 'form-check-label task-item my-1 col-12'
    
    const item_input = document.createElement('input')
    item_input.setAttribute('id', `task-${data.id}-input`)
    item_input.classList = `form-check-input mr-2`
    item_input.setAttribute('type', 'checkbox')
    item_input.setAttribute('name', `task-${data.id}-input`)

    const item_body = document.createElement('span')
    item_body.setAttribute('id', `task-${data.id}-body`)
    item_body.innerHTML = data.body
    
    if (data.checked) {
        item_input.setAttribute('checked', true)
        item_body.style.textDecoration = 'line-through'
    }
    
    // Mark task as done
    item_input.addEventListener('click', function() {
        complete_task(data.id, item_body, data.card_id)
    })

    item.append(item_input, item_body)
    selector('#modal-tasks').append(item)
}

function complete_task(task_id, body, card_id) {
    fetch(`/tasks/${task_id}/complete`)
    .then(res => res.json())
    .then(data => {
        const count = selector(`.tasks-${card_id}-checked`)
        var count_int = parseInt(count.innerText)
        if (data.checked) {
            body.style.textDecoration = 'line-through'
            count.innerHTML = count_int + 1
        } else {
            body.style.textDecoration = ''
            count.innerHTML = count_int - 1
        }
    })
    .catch(err => console.log('Complete task:', err));
}
