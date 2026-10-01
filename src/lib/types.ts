// Shared types for the bundled seed-data JSON in $lib/data.
// The .md files in the project docs remain the human-reviewed source of truth;
// these JSON files are the generated, versioned runtime copies.

export interface Fundamental {
	id: string; // e.g. "F1"
	name: string;
	description: string;
	tells: string;
}

export interface Skill {
	id: string; // e.g. "S1"
	name: string;
	summary: string;
	fundamentals: Fundamental[];
}

export interface LevelBand {
	level: number;
	name: string;
	description: string;
}

export interface Drill {
	id: string; // e.g. "D10"
	name: string;
	levelLabel: string; // e.g. "1–2"
	levelMin: number;
	levelMax: number;
	terrain: string;
	terrainTypes: string[]; // terrain type ids, e.g. ["T2", "T3"]
	trains: string[]; // fundamental ids, e.g. ["F4", "F5"]
	purpose: string;
	howTo: string;
	cues: string[];
	watchFor: string;
	easier?: string;
	harder?: string;
	fallback?: string;
	progression?: string;
}

export interface CauseEffect {
	internalCue: string; // what the student feels — ask them
	externalCue: string; // what the instructor sees
	likelyCause: string;
	tryDrills: string[]; // drill ids
}

export type GateKind = 'skill' | 'route-completion' | 'safety' | 'awareness' | 'none';

export interface Gate {
	id: string;
	liftOrTerrain: string;
	requirement: string;
	skills: string[]; // fundamental ids
	kind: GateKind;
	why: string;
}

export interface TerrainType {
	id: string; // e.g. "T2"
	name: string;
	description: string;
}

export interface TerrainEntry {
	trail: string;
	difficulty: 'easiest' | 'more-difficult' | 'most-difficult' | 'expert';
	lift: string;
	notes?: string;
}

export interface Alert {
	id: string;
	title: string;
	detail: string;
	appliesToLevels: number[];
}
