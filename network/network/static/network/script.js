document.addEventListener('DOMContentLoaded', function () {

    // Edit an existing post
    document.querySelectorAll('.edit-post').forEach(editpost => {
        editpost.onclick = () => {
            const post_id = editpost.dataset.id
            document.querySelector(`#post-${post_id}`).style.display = 'none';
            document.querySelector(`#edit-section-${post_id}`).style.display = '';

            document.querySelector(`#editpost-${post_id}`).onsubmit = function (e) {
                e.preventDefault()
                postText = document.querySelector(`#post-text-${post_id}`).value
                if (postText.length != 0) {
                    fetch(`edit/${post_id}`, {
                        method: 'POST',
                        body: JSON.stringify({
                            "post-to-edit": postText
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            document.querySelector(`#post-${post_id}`).innerHTML = postText
                            document.querySelector(`#post-${post_id}`).style.display = '';
                            document.querySelector(`#edit-section-${post_id}`).style.display = 'none';
                        })
                        .catch(error => console.log("Error editing post:", error));
                }
                document.querySelector(`#post-text-${post_id}`).value = ''
                return false
            }
        }


    }, false);

    // Like or Unlike post
    document.querySelectorAll('.like-post').forEach(likepost => {
        likepost.onclick = () => {
            const post_id = likepost.dataset.id
            const post_like = likepost.dataset.like
            fetch(`like`, {
                method: 'POST',
                body: JSON.stringify({
                    "post-id": post_id,
                    "post-liked": post_like,
                })
            })
                .then(res => res.json())
                .then(data => {
                    likepost.setAttribute('data-like', `${data.liked}`)
                    data.liked == 'false' ? likepost.innerHTML = 'Like' : likepost.innerHTML = 'Unlike'
                    document.querySelector(`#post-likes-${post_id}`).innerHTML = data.likes
                })
                .catch(err => {
                    console.log('Error like:', err)
                });
        }
    }, false);
});
