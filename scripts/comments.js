async function loadComments() {
    const response = await fetch("https://yackbros-backend-vercel.vercel.app/api/comments");
    const comments = await response.json();
    const list = document.getElementById("comments-list");

    list.innerHTML = ''; // clear before re-rendering

    comments.forEach(comment => {
        const li = document.createElement("li");
        li.classList.add("comment");
        li.innerHTML = `
        <div class="comment-name">${comment.name}</div>
        <div class="comment-message">${comment.message}</div>
        <div class="comment-date">${new Date(comment.date).toLocaleString()}</div>
      `;
        list.appendChild(li);
    });
}

async function submitComment(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !message) return;

    const res = await fetch("https://yackbros-backend-vercel.vercel.app/api/add-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message })
    });

    if (res.ok) {
        document.getElementById("comment-form").reset();
        await loadComments();  // refresh comment list
    } else {
        alert("Failed to post comment.");
    }
}

window.addEventListener('load', () => {
    loadComments();
    document.getElementById("comment-form").addEventListener("submit", submitComment);
});
