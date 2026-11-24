document.addEventListener('DOMContentLoaded', () => {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    if (window.lucide) {
        window.lucide.createIcons();
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    document.querySelectorAll('.password-toggle').forEach((button) => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            input.type = input.type === 'password' ? 'text' : 'password';
            button.setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password');
        });

        document.querySelectorAll('[data-focus-post], .mobile-create').forEach((button) => {
            button.addEventListener('click', (event) => {
                const postInput = document.querySelector('#postForm input[name="content"]');
                if (!postInput) return;
                event.preventDefault();
                postInput.focus();
                postInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    });

    document.querySelectorAll('.auth-form').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            let valid = true;
            form.querySelectorAll('input[required]').forEach((input) => {
                const field = input.closest('.form-field');
                const error = field.querySelector('.field-error');
                field.classList.remove('invalid');
                error.textContent = '';
                if (!input.value.trim()) {
                    valid = false;
                    field.classList.add('invalid');
                    error.textContent = 'This field is required.';
                } else if (input.type === 'email' && !input.checkValidity()) {
                    valid = false;
                    field.classList.add('invalid');
                    error.textContent = 'Enter a valid email address.';
                } else if (input.minLength > 0 && input.value.length < input.minLength) {
                    valid = false;
                    field.classList.add('invalid');
                    error.textContent = `Use at least ${input.minLength} characters.`;
                }
            });
            if (valid) {
                const submitButton = form.querySelector('[type="submit"]');
                submitButton.disabled = true;
                submitButton.textContent = 'Please wait...';
                const payload = Object.fromEntries(new FormData(form));
                const endpoint = form.id === 'registerForm'
                    ? '/api/auth/register/'
                    : '/api/auth/login/';
                fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken(),
                    },
                    body: JSON.stringify(payload),
                })
                    .then(async (response) => {
                        const data = await response.json();
                        if (!response.ok) {
                            throw new Error(data.detail || Object.values(data).flat().join(' '));
                        }
                        window.location.href = '/home/';
                    })
                    .catch((error) => {
                        submitButton.disabled = false;
                        submitButton.innerHTML = form.id === 'registerForm'
                            ? 'Create account <i data-lucide="arrow-right"></i>'
                            : 'Login <i data-lucide="arrow-right"></i>';
                        if (window.lucide) window.lucide.createIcons();
                        const heading = form.querySelector('.auth-heading');
                        let alert = form.querySelector('.api-error');
                        if (!alert) {
                            alert = document.createElement('p');
                            alert.className = 'api-error';
                            heading.after(alert);
                        }
                        alert.textContent = error.message;
                    });
            }
        });
    });

    function getCsrfToken() {
        const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/);
        return match ? decodeURIComponent(match[1]) : '';
    }

    async function apiRequest(url, options = {}) {
        const headers = options.headers || {};
        if (options.method && options.method !== 'GET') {
            headers['X-CSRFToken'] = getCsrfToken();
        }
        const response = await fetch(url, { ...options, headers });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.detail || 'Something went wrong.');
        }
        return data;
    }

    const feedPosts = document.getElementById('feedPosts');
    if (feedPosts) {
        loadFeed();

        document.getElementById('postForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const content = form.elements.content.value.trim();
            if (!content) return;
            try {
                await apiRequest('/api/posts/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content }),
                });
                form.reset();
                loadFeed();
            } catch (error) {
                showFeedError(error.message);
            }
        });
    }

    async function loadFeed() {
        feedPosts.innerHTML = '<section class="feed-loading"><span class="loading-spinner"></span><p>Loading your feed...</p></section>';
        try {
            const posts = await apiRequest('/api/posts/?feed=true');
            if (!posts.length) {
                feedPosts.innerHTML = '<section class="feed-empty"><span><i data-lucide="users"></i></span><h2>Your feed is ready</h2><p>Follow people and create posts to see updates here.</p><button class="button button-primary">Discover people</button></section>';
            } else {
                feedPosts.innerHTML = posts.map(renderPost).join('');
                bindPostActions();
            }
            if (window.lucide) window.lucide.createIcons();
        } catch (error) {
            if (error.message.includes('Authentication') || error.message.includes('credentials')) {
                window.location.href = '/login/';
                return;
            }
            showFeedError(error.message);
        }
    }

    function renderPost(post) {
        const author = post.author.username || 'User';
        const initials = author.slice(0, 2).toUpperCase();
        return `<article class="post-card" data-post-id="${post.id}">
            <div class="post-author">
                <span class="post-author-avatar">${initials}</span>
                <div class="post-author-info"><strong>@${escapeHtml(author)}</strong><small>${new Date(post.created_at).toLocaleString()}</small></div>
            </div>
            <p class="post-content">${escapeHtml(post.content)}</p>
            <div class="post-actions">
                <button type="button" class="like-button ${post.is_liked ? 'liked' : ''}" data-action="like"><i data-lucide="heart"></i><span>${post.like_count}</span></button>
                <button type="button" data-action="comment"><i data-lucide="message-circle"></i><span>${post.comments.length}</span></button>
            </div>
            <form class="comment-form"><input name="content" placeholder="Write a comment..." required><button type="submit">Send</button></form>
        </article>`;
    }

    function bindPostActions() {
        document.querySelectorAll('.like-button').forEach((button) => {
            button.addEventListener('click', async () => {
                const postId = button.closest('.post-card').dataset.postId;
                try {
                    const data = await apiRequest(`/api/posts/${postId}/like/`, { method: 'POST' });
                    button.classList.toggle('liked', data.liked);
                    button.querySelector('span').textContent = data.like_count;
                } catch (error) {
                    showFeedError(error.message);
                }
            });
        });
        document.querySelectorAll('.comment-form').forEach((form) => {
            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const postId = form.closest('.post-card').dataset.postId;
                const content = form.elements.content.value.trim();
                if (!content) return;
                try {
                    await apiRequest('/api/comments/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ post: postId, content }),
                    });
                    form.reset();
                    loadFeed();
                } catch (error) {
                    showFeedError(error.message);
                }
            });
        });
    }

    function showFeedError(message) {
        const alert = document.createElement('p');
        alert.className = 'api-error';
        alert.textContent = message;
        feedPosts.prepend(alert);
    }

    function escapeHtml(value) {
        const element = document.createElement('span');
        element.textContent = value || '';
        return element.innerHTML;
    }

    const searchForm = document.getElementById('userSearchForm');
    if (searchForm) {
        const runSearch = async () => {
            const query = document.getElementById('userSearchInput').value.trim();
            const results = document.getElementById('searchResults');
            results.innerHTML = '<section class="feed-loading"><span class="loading-spinner"></span></section>';
            try {
                const users = await apiRequest(`/api/profiles/?search=${encodeURIComponent(query)}`);
                if (!users.length) {
                    results.innerHTML = '<p>No matching profiles found.</p>';
                    return;
                }
                results.innerHTML = users.map((user) => {
                    const name = user.profile.full_name || user.username;
                    return `<article class="search-result">
                        <span class="search-result-avatar">${escapeHtml(name.slice(0, 2).toUpperCase())}</span>
                        <div><strong>${escapeHtml(name)}</strong><small>@${escapeHtml(user.username)}</small></div>
                        <button type="button" data-user-id="${user.id}" class="follow-search-button">Follow</button>
                    </article>`;
                }).join('');
                document.querySelectorAll('.follow-search-button').forEach((button) => {
                    button.addEventListener('click', async () => {
                        try {
                            const data = await apiRequest(`/api/profiles/${button.dataset.userId}/follow/`, { method: 'POST' });
                            button.textContent = data.following ? 'Following' : 'Follow';
                            showToast(data.following ? 'You are now following this user.' : 'User unfollowed.');
                        } catch (error) {
                            showToast(error.message, 'error');
                        }
                    });
                });
            } catch (error) {
                results.innerHTML = `<p class="api-error">${escapeHtml(error.message)}</p>`;
            }
        };
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            runSearch();
        });
        if (document.getElementById('userSearchInput').value.trim()) {
            runSearch();
        }
    }

    const profilePage = document.querySelector('.profile-page');
    if (profilePage) {
        const username = profilePage.dataset.username;
        (async () => {
            try {
                const users = await apiRequest(`/api/profiles/?search=${encodeURIComponent(username)}`);
                const profile = users.find((user) => user.username === username);
                if (!profile) {
                    document.getElementById('profileName').textContent = 'Profile not found';
                    return;
                }
                document.getElementById('profileName').textContent = profile.profile.full_name || `@${profile.username}`;
                document.getElementById('profileBio').textContent = profile.profile.bio || 'No bio yet.';
                document.getElementById('profileAvatar').textContent = (profile.profile.full_name || profile.username).slice(0, 2).toUpperCase();
                document.getElementById('followButton').dataset.userId = profile.id;

                const posts = await apiRequest('/api/posts/');
                const ownPosts = posts.filter((post) => post.author.username === username);
                document.getElementById('profilePostCount').textContent = ownPosts.length;
                document.getElementById('profilePosts').innerHTML = ownPosts.length
                    ? ownPosts.map(renderPost).join('')
                    : '<section class="feed-empty"><h2>No posts yet</h2><p>This profile has not shared anything.</p></section>';
            } catch (error) {
                showToast(error.message, 'error');
            }
        })();

        document.getElementById('followButton').addEventListener('click', async (event) => {
            const button = event.currentTarget;
            if (!button.dataset.userId) return;
            try {
                const data = await apiRequest(`/api/profiles/${button.dataset.userId}/follow/`, { method: 'POST' });
                button.textContent = data.following ? 'Following' : 'Follow';
                showToast(data.following ? 'You are now following this user.' : 'User unfollowed.');
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
});
