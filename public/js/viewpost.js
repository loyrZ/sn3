const videoObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
        document.getElementById("jump-to-top-button").style.display = "none";
    } else {
        document.getElementById("jump-to-top-button").style.display = "inline-block";
    }
});

const videoElement = document.querySelector(".post-container > video");

function addCommentToScreen(data, container) {
    let commentFragment = document.createElement('template');
    commentFragment.innerHTML =
        `<div id="message-${data.id}" class="comment">
            <strong class="comment-author">${data.username}</strong>
            <span class="comment-date">
                ${(new Date()).toLocaleString("en-us", {
            dateStyle: "long",
            timeStyle: "medium"
        })}
            </span>
            <div class="comment-text">${data.text}</div>
        </div>`;
    container.appendChild(commentFragment.content.firstChild); // Append to end, thus displayed from top to bottom
}

const likeButton = document.getElementById('like-button');
const commentButton = document.getElementById('comment-button');

if (commentButton) {
    commentButton.addEventListener('click', async function (ev) {
        try {
            const text = document.getElementById('comment-text');
            if (!text.value) return;
            const postId = commentButton.dataset.postid;
            const resp = await fetch(`/comments/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text:text.value,
                    postId
                })
            });
            const commentsBox = document.getElementById('comments');
            const data = await resp.json();
            if (data.status === "success") {
                addCommentToScreen(data, commentsBox);
                text.value ="";
            }
        } catch (err) {
            console.log(err);
        }
    });
}

if (likeButton) {
    likeButton.addEventListener('click', async function (ev) {
        try{
            const postId = ev.currentTarget.dataset.postid;
            var resp = await fetch(`/posts/like/${postId}`,{method: "POST"});
            var data = await resp.json();
            console.log();
            if(data.status==succes){
                var lb = document.getElementById('like-button');
                if(data.isLiked){
                    lb.classList.add(`fa-thumbs-down`);
                    lb.classList.remove(`fa-thumbs-up`);
                }else{
                    lb.classList.add(`fa-thumbs-up`);
                    lb.classList.remove(`fa-thumbs-down`);
                }
            }
        }catch(err){
            console.error(err);
        }
    });
}
