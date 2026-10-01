// Versioned, bundled seed data. Generated from the human-reviewed .md seeds;
// the .md files remain the source of truth until the content pipeline is formalized.
// Because this is a static build, everything here ships in the app bundle and
// works offline — content updates ship with deploys.

import skills from './skills.json';
import drills from './drills.json';
import terrain from './terrain.json';
import terrainTypes from './terrain-types.json';
import cues from './cues.json';

export { skills, drills, terrain, terrainTypes, cues };

export type { Drill, CauseEffect, Gate, GateKind, Skill, LevelBand, TerrainType } from '../types';
