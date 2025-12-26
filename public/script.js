// Client-side controller for talking to the server via HTTP.
// POST /add sends user input to the server so it can be persisted in MongoDB.
// GET /all asks the server for the full list so the UI stays in sync with stored data.

const API_BASE = 'https://hirishi-mirror-backend.onrender.com';
const form = document.getElementById('entry-form');
const input = document.getElementById('text-input');
const entriesList = document.getElementById('entries');
const errorBox = document.getElementById('error');
const youAre = document.getElementById('you-are');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  const text = input.value.trim();
  if (!text) return;

  try {
    await fetch(API_BASE + '/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text }),
    });
    input.value = '';
    await loadEntries();
  } catch (err) {
    showError('Failed to save. Please try again.');
    console.error(err);
  }
});

async function loadEntries() {
  try {
    const response = await fetch(API_BASE + '/all', { credentials: 'include' });
    if (!response.ok) throw new Error('Request failed');
    const entries = await response.json();
    renderEntries(entries);
  } catch (err) {
    showError('Failed to load entries.');
    console.error(err);
  }
}

function renderEntries(entries) {
  entriesList.innerHTML = '';
  entries.forEach((entry) => {
    const li = document.createElement('li');
    const text = document.createElement('div');
    text.className = 'text';
    text.textContent = entry.text;

    const meta = document.createElement('div');
    meta.className = 'meta';

    const time = document.createElement('span');
    time.textContent = new Date(entry.createdAt).toLocaleString();

    const user = document.createElement('span');
    user.innerHTML = '<span class="pill">User</span> ' + (entry.userId || 'unknown');

    meta.appendChild(time);
    meta.appendChild(user);

    li.appendChild(text);
    li.appendChild(meta);
    entriesList.appendChild(li);
  });
}

function showError(message) {
  errorBox.textContent = message;
}

function clearError() {
  errorBox.textContent = '';
}

// Initial load to populate the list when the page is opened (read path).
loadEntries();

// Discover who this browser is (userId is stored server-side in an HttpOnly cookie).
(async function identify() {
  try {
    const res = await fetch(API_BASE + '/whoami', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to resolve user');
    const { userId } = await res.json();
    youAre.textContent = `You are: ${userId}`;
  } catch (err) {
    console.error(err);
    youAre.textContent = 'Could not determine your user id.';
  }
})();
