document.addEventListener('DOMContentLoaded', function () {
    
    var myModal = new bootstrap.Modal(selector('#modal-project'), {})
    
    // Add new project
    selector('#btn-new-project').onclick = (e) => {
        e.preventDefault()
        myModal.show()
        selector('.modal-project-title').innerHTML = 'New project'
        selector('#form-project-submit').innerHTML = 'Create'
        selector('.tab-project-members').classList.add('disabled')
        selector('#pane-project-members').classList.add('disabled')

        selector('#form-project').onsubmit = function (e) {
            e.preventDefault();
            fetch('projects/add', {
                method: 'POST',
                body: JSON.stringify({
                    title: selector('#form-project-title').value,
                    description: selector('#form-project-description').value,
                    due_date: selector('#form-project-due-date').value,
                })
            })
            .then(res => res.json())
            .then(data => {
                    myModal.hide()
                    notify(data.message)
                    selector('#no-projects').style.display = 'none'
                    render_project(data)
                })
                .catch(err => console.log('New project:', err));
                
            selector('#form-project-title').value = ''
            selector('#form-project-description').value = ''
            selector('#form-project-due-date').value = ''
            return false;
        };
    }

}, false);


function render_project(data) {
    const item = document.createElement('div')
    item.classList = 'col-md-7 my-2 ml-auto mr-auto'

    const item_container = document.createElement('div')
    item_container.classList = 'card card-body p-3 project-item'
    
    const item_title = document.createElement('a')
    item_title.classList = 'h5 project-item-title'
    item_title.setAttribute('href', `/projects/${data.id}`)
    item_title.innerHTML = data.title

    const item_description = document.createElement('p')
    item_description.classList = 'h5 project-item-description'
    item_description.innerHTML = data.description

    const item_info = document.createElement('span')
    item_info.classList = 'project-item-info text-muted'
    
    const item_info_auth = document.createElement('strong')
    
    const item_info_auth_img = document.createElement('img')
    item_info_auth_img.classList = 'img-fluid'
    // item_info_auth_img.src = '../icons/person-circle.svg'
    item_info_auth_img.src = 'kanban/static/kanban/icons/person-circle.svg'
    
    const item_info_auth_small = document.createElement('small')
    item_info_auth_small.classList = 'project-item-author'
    item_info_auth_small.innerHTML = `${data.user}`

    item_info_auth.append(item_info_auth_img, item_info_auth_small)
    
    const item_info_memb = document.createElement('strong')
    item_info_memb.classList = 'mx-3'

    const item_info_memb_img = document.createElement('img')
    item_info_memb_img.classList = 'img-fluid'
    // item_info_memb_img.src = '../icons/people.svg'
    item_info_memb_img.src = 'kanban/static/kanban/icons/people.svg'
    
    const item_info_memb_small = document.createElement('small')
    item_info_memb_small.classList = 'project-item-members'
    item_info_memb_small.innerHTML = '1'

    item_info_memb.append(item_info_memb_img, item_info_memb_small)

    const item_info_due = document.createElement('strong')
    
    const item_info_due_img = document.createElement('img')
    item_info_due_img.classList = 'img-fluid'
    item_info_due_img.src = 'kanban/static/kanban/icons/calendar-month.svg'

    const item_info_due_small = document.createElement('small')
    item_info_due_small.classList = 'project-item-date'
    item_info_due_small.innerHTML = `${data.due_date}`

    item_info_due.append(item_info_due_img, item_info_due_small)

    item_info.append(item_info_auth, item_info_memb, item_info_due)    
    item_container.append(item_title, item_description, item_info)
    item.append(item_container)
 
    const firstElement = selector('#projects-list').firstChild
    selector('#projects-list').insertBefore(item, firstElement)
}