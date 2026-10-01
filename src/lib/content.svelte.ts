// Admin-editable content layer.
//
// The JSON in $lib/data is the versioned source of truth (generated from the
// human-reviewed .md seeds). This module layers per-browser overrides on top
// (localStorage), so labels/descriptions can be tweaked live in the app via
// the /admin page. "Export JSON" produces an updated skills.json to commit,
// keeping the human-reviewed pipeline intact.

import { browser } from '$app/environment';
import { skills as seedSkills } from './data';
import type { Fundamental } from './types';

const STORAGE_KEY = 'skicoach-fundamental-overrides-v1';

export interface FundamentalOverride {
	name?: string;
	description?: string;
}

function loadOverrides(): Record<string, FundamentalOverride> {
	if (!browser) return {};
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
	} catch {
		return {};
	}
}

export const overrides = $state<Record<string, FundamentalOverride>>(loadOverrides());

export function saveOverrides(): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function resetOverrides(): void {
	if (!browser) return;
	localStorage.removeItem(STORAGE_KEY);
	for (const key of Object.keys(overrides)) delete overrides[key];
}

function applyOverride(f: Fundamental): Fundamental {
	const o = overrides[f.id];
	if (!o) return f;
	const name = o.name?.trim();
	const description = o.description?.trim();
	return {
		...f,
		name: name ? name : f.name,
		description: description ? description : f.description
	};
}

// Shared reactive store (class getters are the idiomatic way to expose
// derived state from a .svelte.ts module). Import `content` — not the raw
// seed — wherever fundamental names/descriptions render.
class ContentStore {
	get skillsView() {
		return {
			...seedSkills,
			skills: seedSkills.skills.map((s) => ({
				...s,
				fundamentals: s.fundamentals.map(applyOverride)
			}))
		};
	}

	get fundamentals(): Fundamental[] {
		return this.skillsView.skills.flatMap((s) => s.fundamentals);
	}

	// Full updated skills.json (overrides applied), ready to commit.
	exportSkillsJson(): string {
		return JSON.stringify(this.skillsView, null, 2);
	}
}

export const content = new ContentStore();
