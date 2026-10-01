// GitHub publishing from the admin page.
//
// A static GitHub Pages site cannot hold a secret or complete GitHub's OAuth
// device flow (github.com/login/* sends no CORS headers), so the admin page
// publishes with a fine-grained Personal Access Token the maintainer pastes
// once. api.github.com *does* send CORS headers, so the Contents API works
// directly from the browser. The token lives only in this browser's
// localStorage and is sent solely as the Authorization header to api.github.com.
// Recommended scope: fine-grained PAT, repository dfaourgatech/SkiSchoolApp
// only, Contents: Read and write.

import { browser } from '$app/environment';

const TOKEN_KEY = 'skicoach-github-token';
const OWNER = 'dfaourgatech';
const REPO = 'SkiSchoolApp';
const BRANCH = 'main';

export const ghToken = $state<{ value: string }>({
	value: browser ? (localStorage.getItem(TOKEN_KEY) ?? '') : ''
});

export function setGhToken(token: string): void {
	ghToken.value = token.trim();
	if (!browser) return;
	if (ghToken.value) localStorage.setItem(TOKEN_KEY, ghToken.value);
	else localStorage.removeItem(TOKEN_KEY);
}

async function api(path: string, init?: RequestInit): Promise<any> {
	const res = await fetch(`https://api.github.com${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${ghToken.value}`,
			Accept: 'application/vnd.github+json',
			...init?.headers
		}
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`GitHub API ${res.status}: ${body.slice(0, 200)}`);
	}
	return res.json();
}

// Verify the token works and can push to the repo. Returns the login name.
export async function checkGhConnection(): Promise<string> {
	const [me, repo] = await Promise.all([api('/user'), api(`/repos/${OWNER}/${REPO}`)]);
	if (!repo.permissions?.push) {
		throw new Error(`Token has no write access to ${OWNER}/${REPO}.`);
	}
	return me.login as string;
}

function toBase64(s: string): string {
	return btoa(unescape(encodeURIComponent(s)));
}

export async function commitFile(path: string, content: string, message: string): Promise<void> {
	const meta = await api(`/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`);
	await api(`/repos/${OWNER}/${REPO}/contents/${path}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			message,
			content: toBase64(content),
			sha: meta.sha,
			branch: BRANCH
		})
	});
}
