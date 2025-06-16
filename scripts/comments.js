const API = {
    list: 'https://yackbros-backend-vercel.vercel.app/api/comments',
    post: 'https://yackbros-backend-vercel.vercel.app/api/comments',
    toggleLike: 'https://yackbros-backend-vercel.vercel.app/api/toggle-like'
};

const commentsList = document.getElementById('comments-list');
const form = document.getElementById('comment-form');

let comments = [];

// In-memory store of comment IDs liked in this page-load
const likedThisPage = new Set();

function isLiked(id) {
    return likedThisPage.has(id);
}

function setLiked(id, liked) {
    let set = JSON.parse(sessionStorage.getItem('likedComments')||'[]');
    if (liked) {
        if (!set.includes(id)) set.push(id);
    } else {
        set = set.filter(x=>x!==id);
    }
    sessionStorage.setItem('likedComments', JSON.stringify(set));
}

// Fetch & render
async function loadComments() {
    const res = await fetch(API.list);
    comments = await res.json();
    renderComments();
}

function renderComments() {
    commentsList.innerHTML = '';
    comments.forEach(c => {
        const liked = isLiked(c._id);
        const li = document.createElement('li');
        li.className = 'comment';
        li.innerHTML = `
      <strong>${c.name}</strong>
      <p>${c.message}</p>
      <button 
        class="like-btn${liked ? ' liked' : ''}" 
        data-id="${c._id}"
      >
        <svg viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                   C2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5
                   2.09C13.09 3.81 14.76 3 16.5 3
                   C19.58 3 22 5.42 22 8.5
                   c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <span class="count">${c.likes}</span>
      </button>
    `;
        commentsList.appendChild(li);
    });
}

// Delegate all like-button clicks
commentsList.addEventListener('click', async e => {
    const btn = e.target.closest('button.like-btn');
    if (!btn) return;

    const id = btn.dataset.id;
    const alreadyLiked = isLiked(id);
    const action = alreadyLiked ? 'unlike' : 'like';

    // Send toggle request
    const res = await fetch(API.toggleLike, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: id, action })
    });
    if (!res.ok) {
        console.error('toggle-like failed:', await res.text());
        return;
    }
    const { likes: newCount } = await res.json();

    // Update our in-memory tracking and the UI
    if (alreadyLiked) likedThisPage.delete(id);
    else              likedThisPage.add(id);

    btn.classList.toggle('liked', !alreadyLiked);
    btn.querySelector('.count').textContent = newCount;
});

// Initial load
(async function loadComments() {
    const res = await fetch(API.list);
    comments = await res.json();
    renderComments();
})();

form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const message = form.message.value.trim();
    if (!name || !message) return;
    await fetch(API.post, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, message })
    });
    form.message.value = '';
    await loadComments();
});

loadComments();