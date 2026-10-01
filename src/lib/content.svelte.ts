// Admin-editable content layer.
//
// The JSON in $lib/data is the versioned source of truth (generated from the
// human-reviewed .md seeds). This module layers per-browser overrides on top
// (localStorage), so labels/descriptions and drill content can be tweaked live
// in the app via the /admin page. "Export JSON" produces updated seed files to
// commit, keeping the human-reviewed pipeline intact.

import { browser } from '$app/environment';
import { skills as seedSkills, drills as seedDrills, terrainTypes as seedTerrainTypes } from './data';
import type { Drill, Fundamental, TerrainType } from './types';

const FUNDAMENTAL_STORAGE_KEY = 'skicoach-fundamental-overrides-v1';
const SKILL_STORAGE_KEY = 'skicoach-skill-overrides-v1';
const DRILL_STORAGE_KEY = 'skicoach-drill-overrides-v1';
const TERRAIN_TYPES_STORAGE_KEY = 'skicoach-terraintypes-override-v1';

export interface FundamentalOverride {
	name?: string;
	description?: string;
}

export interface SkillOverride {
	name?: string;
	summary?: string;
}

function loadFromKey<T>(key: string): Record<string, T> {
	if (!browser) return {};
	try {
		return JSON.parse(localStorage.getItem(key) ?? '{}');
	} catch {
		return {};
	}
}

function saveToKey(key: string, value: object): void {
	if (!browser) return;
	localStorage.setItem(key, JSON.stringify(value));
}

function clearKey(key: string, record: Record<string, unknown>): void {
	if (!browser) return;
	localStorage.removeItem(key);
	for (const k of Object.keys(record)) delete record[k];
}

export const overrides = $state<Record<string, FundamentalOverride>>(
	loadFromKey<FundamentalOverride>(FUNDAMENTAL_STORAGE_KEY)
);

export const skillOverrides = $state<Record<string, SkillOverride>>(
	loadFromKey<SkillOverride>(SKILL_STORAGE_KEY)
);

export const drillOverrides = $state<Record<string, Partial<Drill>>>(
	loadFromKey<Partial<Drill>>(DRILL_STORAGE_KEY)
);

// Full-list override for terrain types (simpler than per-id deltas, since the
// admin supports add/delete/rename here). null = no override, use seed.
function loadTerrainTypeOverride(): TerrainType[] | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(TERRAIN_TYPES_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as TerrainType[]) : null;
	} catch {
		return null;
	}
}

export const terrainTypeList = $state<{ types: TerrainType[] | null }>({
	types: loadTerrainTypeOverride()
});

export function saveTerrainTypeList(): void {
	if (!browser || !terrainTypeList.types) return;
	saveToKey(TERRAIN_TYPES_STORAGE_KEY, terrainTypeList.types);
}

export function resetTerrainTypeList(): void {
	if (!browser) return;
	localStorage.removeItem(TERRAIN_TYPES_STORAGE_KEY);
	terrainTypeList.types = null;
}

export function saveOverrides(): void {
	saveToKey(FUNDAMENTAL_STORAGE_KEY, overrides);
}

export function saveSkillOverrides(): void {
	saveToKey(SKILL_STORAGE_KEY, skillOverrides);
}

export function saveDrillOverrides(): void {
	saveToKey(DRILL_STORAGE_KEY, drillOverrides);
}

export function resetOverrides(): void {
	clearKey(FUNDAMENTAL_STORAGE_KEY, overrides);
}

export function resetSkillOverrides(): void {
	clearKey(SKILL_STORAGE_KEY, skillOverrides);
}

export function resetDrillOverrides(): void {
	clearKey(DRILL_STORAGE_KEY, drillOverrides);
}

// Drop no-op drill overrides (empty values, or values identical to the seed)
// so clearing a field reverts to seed data instead of blanking it.
export function pruneDrillOverrides(seed: Drill[]): void {
	const byId = new Map(seed.map((d) => [d.id, d]));
	for (const [id, o] of Object.entries(drillOverrides)) {
		const s = byId.get(id);
		for (const key of Object.keys(o) as (keyof Drill)[]) {
			const v: unknown = o[key];
			const sv: unknown = s?.[key];
			const empty =
				v === undefined ||
				v === null ||
				(typeof v === 'string' && !v.trim()) ||
				(Array.isArray(v) && v.length === 0);
			if (empty || (s && JSON.stringify(v) === JSON.stringify(sv))) {
				delete o[key];
			}
		}
		if (Object.keys(o).length === 0) delete drillOverrides[id];
	}
}

function applyFundamentalOverride(f: Fundamental): Fundamental {
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
// seeds — wherever admin-editable content renders.
class ContentStore {
	get skillsView() {
		return {
			...seedSkills,
			skills: seedSkills.skills.map((s) => {
				const so = skillOverrides[s.id];
				const name = so?.name?.trim();
				const summary = so?.summary?.trim();
				return {
					...s,
					name: name ? name : s.name,
					summary: summary ? summary : s.summary,
					fundamentals: s.fundamentals.map(applyFundamentalOverride)
				};
			})
		};
	}

	get fundamentals(): Fundamental[] {
		return this.skillsView.skills.flatMap((s) => s.fundamentals);
	}

	get drillsView() {
		return {
			...seedDrills,
			drills: seedDrills.drills.map((d) => ({ ...d, ...(drillOverrides[d.id] ?? {}) }))
		};
	}

	get terrainTypes(): TerrainType[] {
		return terrainTypeList.types ?? seedTerrainTypes.types;
	}

	// Full updated seed files (overrides applied), ready to commit.
	exportSkillsJson(): string {
		return JSON.stringify(this.skillsView, null, 2);
	}

	exportDrillsJson(): string {
		return JSON.stringify(this.drillsView, null, 2);
	}

	exportTerrainTypesJson(): string {
		return JSON.stringify(
			{ ...seedTerrainTypes, types: this.terrainTypes },
			null,
			2
		);
	}
}

export const content = new ContentStore();
