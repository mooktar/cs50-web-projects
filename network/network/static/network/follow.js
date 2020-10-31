document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('#follow-user').onclick = () => {
        const follow_user = document.querySelector('#follow-user')
        fetch('/follow', {
            method: 'POST',
            body: JSON.stringify({
                "user-id": follow_user.dataset.id,
                "followed": follow_user.innerText,
            })
        })
            .then(response => response.json())
            .then(res => {
                follow_user.innerText = res.followed
                document.querySelector('#profile-followers').innerHTML = res.followers
                document.querySelector('#profile-following').innerHTML = res.following
            })
            .catch(err => console.log('Err:', err));
    }

}, false);