document.addEventListener('DOMContentLoaded', function () {

    // Add a new post
    document.querySelector('#addpost').onsubmit = function (e) {
        e.preventDefault()
        const postText = document.querySelector('#post-text').value
        if (postText.length != 0) {
            fetch('add', {
                method: 'POST',
                body: JSON.stringify({
                    "post": document.querySelector('#post-text').value
                })
            })
                .then(response => response.json())
                .then(data => {
                    data.status == 201 ? add_post(data) : console.log(data.error)
                })
                .catch(error => console.log("Error posting:", error));
        }
        document.querySelector('#post-text').value = ''
        return false
    };
});


// FUNCTIONS -----------------------------------

/* Rendering new post */
function add_post(post) {
    const item = document.createElement('div')
    item.setAttribute('class', 'list-group-item list-group-item-actio flex-column align-items-start p-2 my-1')

    const item_head = document.createElement('small')
    item_head.setAttribute('class', 'mb-2')

    const item_username = document.createElement('a')
    item_username.setAttribute('href', `user/${post.user}`)
    item_username.innerHTML = `<strong>${post.user}</strong>`

    const item_timestamp = document.createElement('span')
    item_timestamp.className = 'mx-3'
    item_timestamp.innerHTML = post.timestamp

    const item_like = document.createElement('span')
    item_like.setAttribute('data-id', `${post.id}`)
    item_like.setAttribute('data-like', 'false')
    item_like.classList = 'like-post mr-1'
    item_like.innerHTML = 'Like'

    const item_likes = document.createElement('strong')
    item_likes.setAttribute('id', `post-likes-${post.id}`)
    item_likes.innerHTML = '0'

    const item_edit = document.createElement('a')
    item_edit.setAttribute('id', `edit-post-${post.id}`)
    item_edit.classList = 'edit-post ml-2'
    item_edit.setAttribute('data-id', `${post.id}`)
    item_edit.innerHTML = 'Edit'

    item_head.append(item_username, item_timestamp, item_like, item_likes, item_edit)

    const item_body = document.createElement('div')
    item_body.classList = 'h5 mb-1'
    item_body.innerHTML = post.post

    const item_form = document.createElement('div')
    item_form.setAttribute('id', `edit-section-${post.id}`)
    item_form.style.display = 'none'
    item_form.innerHTML = `<form id="editpost-${post.id}" class="form-inline">
                                <div class="input-group w-100">
                                    <textarea class="form-control" name="post-text-${post.id}" id="post-text-${post.id}" rows="1" resize="off">${post.post}</textarea>
                                    <div class="input-group-append">
                                        <button type="submit" class="btn btn-primary">save</button>
                                    </div>
                                </div>
                            </form>`

    item.append(item_head, item_body, item_form)
    document.querySelector('#new-post').append(item)
}
