const API = {
    list: 'https://yackbros-backend-vercel.vercel.app/api/comments',
    post: 'https://yackbros-backend-vercel.vercel.app/api/comments',
    toggleLike: 'https://yackbros-backend-vercel.vercel.app/api/toggle-like'
};

const commentsList = document.getElementById('comments-list');
const form = document.getElementById('comment-form');
const nameInput = document.getElementById('name');
const messageInput = document.getElementById('message');
const websiteInput = document.getElementById('website');
const commentsStatus = document.getElementById('comments-status');
const formStatus = document.getElementById('form-status');
const submitButton = form?.querySelector('button[type="submit"]');
const turnstileContainer = document.getElementById('turnstile-container');
const turnstileWidget = document.getElementById('turnstile-widget');
const TURNSTILE_SITE_KEY = document.querySelector('meta[name="turnstile-site-key"]')?.content?.trim() || '';
let turnstileWidgetId = null;

let comments = [];

const likedThisPage = new Set(JSON.parse(sessionStorage.getItem('likedComments') || '[]'));

function isLiked(id) {
    return likedThisPage.has(id);
}

function persistLikes() {
    sessionStorage.setItem('likedComments', JSON.stringify([...likedThisPage]));
}

function setLiked(id, liked) {
    if (liked) {
        likedThisPage.add(id);
    } else {
        likedThisPage.delete(id);
    }
    persistLikes();
}

function setCommentsStatus(message, state = '') {
    commentsStatus.textContent = message;
    commentsStatus.dataset.state = state;
    commentsStatus.hidden = !message;
}

function setFormStatus(message, state = '') {
    formStatus.textContent = message;
    formStatus.dataset.state = state;
}

function getTurnstileToken() {
    if (!TURNSTILE_SITE_KEY || !window.turnstile || turnstileWidgetId === null) {
        return '';
    }
    const token = window.turnstile.getResponse(turnstileWidgetId);
    return typeof token === 'string' ? token : '';
}

function resetTurnstile() {
    if (!TURNSTILE_SITE_KEY || !window.turnstile || turnstileWidgetId === null) {
        return;
    }
    window.turnstile.reset(turnstileWidgetId);
}

function initializeTurnstile() {
    if (!TURNSTILE_SITE_KEY || !turnstileContainer || !turnstileWidget) {
        return;
    }

    const renderWidget = () => {
        if (!window.turnstile || turnstileWidgetId !== null) {
            return;
        }
        turnstileWidgetId = window.turnstile.render(turnstileWidget, {
            sitekey: TURNSTILE_SITE_KEY,
            theme: 'dark'
        });
        turnstileContainer.hidden = false;
    };

    if (window.turnstile) {
        renderWidget();
        return;
    }

    window.addEventListener('load', renderWidget, { once: true });
}

function formatCommentDate(comment) {
    const rawDate = comment.createdAt || comment.date;
    if (!rawDate) return '';

    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return '';

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(parsed);
}

function createCommentElement(comment) {
    const liked = isLiked(comment._id);
    const li = document.createElement('li');
    li.className = 'comment';

    const header = document.createElement('div');
    header.className = 'comment-header';

    const identity = document.createElement('div');
    identity.className = 'comment-identity';

    const name = document.createElement('strong');
    name.className = 'comment-name';
    name.textContent = comment.name;
    identity.appendChild(name);

    const formattedDate = formatCommentDate(comment);
    if (formattedDate) {
        const date = document.createElement('span');
        date.className = 'comment-date';
        date.textContent = formattedDate;
        identity.appendChild(date);
    }

    const likeButton = document.createElement('button');
    likeButton.type = 'button';
    likeButton.className = `like-btn${liked ? ' liked' : ''}`;
    likeButton.dataset.id = comment._id;
    likeButton.setAttribute('aria-pressed', String(liked));
    likeButton.setAttribute('aria-label', liked ? 'Unlike comment' : 'Like comment');
    likeButton.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                 C2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5
                 2.09C13.09 3.81 14.76 3 16.5 3
                 C19.58 3 22 5.42 22 8.5
                 c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <span class="count">${comment.likes ?? 0}</span>
    `;

    header.append(identity, likeButton);

    const message = document.createElement('p');
    message.className = 'comment-message';
    message.textContent = comment.message;

    li.append(header, message);
    return li;
}

function renderComments() {
    commentsList.innerHTML = '';

    if (!comments.length) {
        setCommentsStatus('No comments yet. Be the first to leave one.', 'empty');
        return;
    }

    const fragment = document.createDocumentFragment();
    comments.forEach(comment => {
        fragment.appendChild(createCommentElement(comment));
    });
    commentsList.appendChild(fragment);
    setCommentsStatus('');
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    return response.json();
}

async function loadComments() {
    setCommentsStatus('Loading comments...', 'loading');
    try {
        comments = await fetchJson(API.list);
        renderComments();
    } catch (error) {
        console.error('Failed to load comments:', error);
        setCommentsStatus('Comments are unavailable right now. Try again in a moment.', 'error');
    }
}

// Delegate all like-button clicks
commentsList.addEventListener('click', async e => {
    const btn = e.target.closest('button.like-btn');
    if (!btn) return;

    const id = btn.dataset.id;
    const alreadyLiked = isLiked(id);
    const action = alreadyLiked ? 'unlike' : 'like';

    btn.disabled = true;

    try {
        const { likes: newCount } = await fetchJson(API.toggleLike, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentId: id, action })
        });

        setLiked(id, !alreadyLiked);
        btn.classList.toggle('liked', !alreadyLiked);
        btn.setAttribute('aria-pressed', String(!alreadyLiked));
        btn.setAttribute('aria-label', alreadyLiked ? 'Like comment' : 'Unlike comment');
        btn.querySelector('.count').textContent = newCount;
    } catch (error) {
        console.error('toggle-like failed:', error);
    } finally {
        btn.disabled = false;
    }
});

form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const website = websiteInput.value.trim();
    const turnstileToken = getTurnstileToken();
    if (!name || !message) return;

    submitButton.disabled = true;
    setFormStatus('Posting comment...', 'loading');

    try {
        await fetchJson(API.post, {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ name, message, website, turnstileToken })
        });

        messageInput.value = '';
        websiteInput.value = '';
        resetTurnstile();
        setFormStatus('Comment posted.', 'success');
        await loadComments();
    } catch (error) {
        console.error('Failed to post comment:', error);
        setFormStatus('Unable to post right now. Please try again.', 'error');
    } finally {
        submitButton.disabled = false;
    }
});

initializeTurnstile();
loadComments();
