<script lang="ts">
	import { base } from '$app/paths';
	import { skills, drills, terrainTypes as seedTerrainTypes } from '$lib/data';
	import {
		overrides,
		saveOverrides,
		resetOverrides,
		skillOverrides,
		saveSkillOverrides,
		resetSkillOverrides,
		drillOverrides,
		saveDrillOverrides,
		resetDrillOverrides,
		pruneDrillOverrides,
		terrainTypeList,
		saveTerrainTypeList,
		resetTerrainTypeList,
		content
	} from '$lib/content.svelte';
	import { ghToken, setGhToken, checkGhConnection, commitFile } from '$lib/github.svelte';
	import type { Drill, TerrainType } from '$lib/types';

	const fundamentals = skills.skills.flatMap((s) => s.fundamentals);
	const seedDrillsById = new Map(drills.drills.map((d) => [d.id, d]));

	let savedFlash = $state(false);

	// ---- github publishing ----
	let tokenInput = $state('');
	let ghUser = $state('');
	let ghBusy = $state(false);
	let ghError = $state('');
	let publishState = $state<'idle' | 'publishing' | 'done'>('idle');
	const ghConnected = $derived(ghToken.value !== '');

	async function onConnect() {
		ghBusy = true;
		ghError = '';
		try {
			setGhToken(tokenInput);
			ghUser = await checkGhConnection();
			tokenInput = '';
		} catch (e) {
			setGhToken('');
			ghError = e instanceof Error ? e.message : String(e);
		} finally {
			ghBusy = false;
		}
	}

	function onDisconnect() {
		setGhToken('');
		ghUser = '';
		ghError = '';
	}

	async function onPublish() {
		publishState = 'publishing';
		ghError = '';
		try {
			onSave(); // persist local edits first
			const hasFundamentalEdits = Object.keys(overrides).length > 0;
			const hasSkillEdits = Object.keys(skillOverrides).length > 0;
			const hasDrillEdits = Object.keys(drillOverrides).length > 0;
			if (hasFundamentalEdits || hasSkillEdits) {
				await commitFile(
					'src/lib/data/skills.json',
					content.exportSkillsJson(),
					'Update skills seed from admin page'
				);
			}
			if (hasDrillEdits) {
				await commitFile(
					'src/lib/data/drills.json',
					content.exportDrillsJson(),
					'Update drills seed from admin page'
				);
			}
			if (terrainTypeList.types) {
				await commitFile(
					'src/lib/data/terrain-types.json',
					content.exportTerrainTypesJson(),
					'Update terrain types seed from admin page'
				);
			}
			publishState = 'done';
			setTimeout(() => (publishState = 'idle'), 4000);
		} catch (e) {
			ghError = e instanceof Error ? e.message : String(e);
			if (/401/.test(ghError)) onDisconnect();
			publishState = 'idle';
		}
	}

	// ---- fundamentals ----
	function setOverride(id: string, field: 'name' | 'description', value: string) {
		if (!overrides[id]) overrides[id] = {};
		overrides[id][field] = value;
	}

	// ---- skills ----
	function setSkillOverride(id: string, field: 'name' | 'summary', value: string) {
		if (!skillOverrides[id]) skillOverrides[id] = {};
		skillOverrides[id][field] = value;
	}

	// ---- terrain types ----
	let terrainRows = $state<TerrainType[]>(content.terrainTypes.map((t) => ({ ...t })));
	let terrainSavedFlash = $state(false);

	function addTerrainRow() {
		const nums = terrainRows
			.map((r) => parseInt(r.id.slice(1), 10))
			.filter((n) => !Number.isNaN(n));
		const next = nums.length ? Math.max(...nums) + 1 : 1;
		terrainRows = [...terrainRows, { id: `T${next}`, name: 'New terrain type', description: '' }];
	}

	function removeTerrainRow(index: number) {
		terrainRows = terrainRows.filter((_, i) => i !== index);
	}

	function terrainRowsDifferFromSeed(): boolean {
		const seed = seedTerrainTypes.types;
		if (terrainRows.length !== seed.length) return true;
		return terrainRows.some(
			(r, i) =>
				r.id !== seed[i].id || r.name !== seed[i].name || r.description !== seed[i].description
		);
	}

	function persistTerrainTypes(): void {
		if (terrainRowsDifferFromSeed()) {
			terrainTypeList.types = terrainRows.map((r) => ({ ...r }));
			saveTerrainTypeList();
		} else {
			resetTerrainTypeList();
		}
	}

	function onSaveTerrainTypes() {
		persistTerrainTypes();
		terrainSavedFlash = true;
		setTimeout(() => (terrainSavedFlash = false), 2500);
	}

	function onResetTerrainTypes() {
		resetTerrainTypeList();
		terrainRows = seedTerrainTypes.types.map((t) => ({ ...t }));
	}

	// ---- drills ----
	function getDrill(id: string): Drill {
		const seed = seedDrillsById.get(id);
		if (!seed) throw new Error(`unknown drill ${id}`);
		return { ...seed, ...(drillOverrides[id] ?? {}) } as Drill;
	}

	function setDrillField<K extends keyof Drill>(id: string, field: K, value: Drill[K]) {
		if (!drillOverrides[id]) drillOverrides[id] = {};
		drillOverrides[id][field] = value;
	}

	function toggleDrillFundamental(drillId: string, fundId: string, checked: boolean) {
		const current = getDrill(drillId).trains;
		setDrillField(
			drillId,
			'trains',
			checked ? [...current, fundId] : current.filter((x) => x !== fundId)
		);
	}

	function toggleDrillTerrain(drillId: string, typeId: string, checked: boolean) {
		const current = getDrill(drillId).terrainTypes ?? [];
		setDrillField(
			drillId,
			'terrainTypes',
			checked ? [...current, typeId] : current.filter((x) => x !== typeId)
		);
	}

	// ---- actions ----
	function onSave() {
		for (const [id, o] of Object.entries(overrides)) {
			if (!o.name?.trim() && !o.description?.trim()) delete overrides[id];
		}
		saveOverrides();
		for (const [id, o] of Object.entries(skillOverrides)) {
			if (!o.name?.trim() && !o.summary?.trim()) delete skillOverrides[id];
		}
		saveSkillOverrides();
		pruneDrillOverrides(drills.drills as Drill[]);
		saveDrillOverrides();
		persistTerrainTypes();
		savedFlash = true;
		setTimeout(() => (savedFlash = false), 2500);
	}

	function onReset() {
		resetOverrides();
		resetSkillOverrides();
		resetDrillOverrides();
		onResetTerrainTypes();
	}

	function download(filename: string, text: string) {
		const blob = new Blob([text], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<h1>Content admin</h1>
<p class="muted">
	Edit skills, fundamentals, drills, and terrain types below. <strong>Save all changes</strong> stores your
	edits in this browser and they apply across the app immediately.
	<strong>Export</strong> downloads updated seed JSON files — commit those to make
	the changes permanent and keep the versioned seed pipeline as the source of truth.
</p>

<h2>Skills</h2>
<p class="muted">Names and summaries of the three PSIA skills — shown on the fundamentals page.</p>
{#each skills.skills as s (s.id)}
	{@const so = skillOverrides[s.id]}
	<div class="card">
		<h3>{s.id}</h3>
		<label>
			Name
			<input
				value={so?.name ?? s.name}
				oninput={(e) => setSkillOverride(s.id, 'name', e.currentTarget.value)}
			/>
		</label>
		<label>
			Summary
			<textarea
				rows="3"
				value={so?.summary ?? s.summary}
				oninput={(e) => setSkillOverride(s.id, 'summary', e.currentTarget.value)}
			></textarea>
		</label>
	</div>
{/each}

<h2>Fundamentals</h2>
{#each fundamentals as f (f.id)}
	<div class="card">
		<h3>{f.id}</h3>
		<label>
			Label
			<input
				value={overrides[f.id]?.name ?? f.name}
				oninput={(e) => setOverride(f.id, 'name', e.currentTarget.value)}
			/>
		</label>
		<label>
			Description
			<textarea
				rows="3"
				value={overrides[f.id]?.description ?? f.description}
				oninput={(e) => setOverride(f.id, 'description', e.currentTarget.value)}
			></textarea>
		</label>
		<p class="muted">Seed: {f.name} — {f.description}</p>
	</div>
{/each}

<h2>Drills</h2>
<p class="muted">
	Check or uncheck fundamentals to change which ones a drill trains. Clearing a
	field reverts it to the seed value on save.
</p>
{#each drills.drills as d (d.id)}
	{@const drill = getDrill(d.id)}
	<details class="card">
		<summary>{d.id} — {drill.name}</summary>
		<label>
			Drill name
			<input
				value={drill.name}
				oninput={(e) => setDrillField(d.id, 'name', e.currentTarget.value)}
			/>
		</label>
		<fieldset>
			<legend>Fundamentals this drill trains</legend>
			{#each content.fundamentals as f (f.id)}
				<label class="check">
					<input
						type="checkbox"
						checked={drill.trains.includes(f.id)}
						onchange={(e) => toggleDrillFundamental(d.id, f.id, e.currentTarget.checked)}
					/>
					{f.name}
				</label>
			{/each}
		</fieldset>
		<fieldset>
			<legend>Terrain types this drill suits</legend>
			{#each content.terrainTypes as t (t.id)}
				<label class="check">
					<input
						type="checkbox"
						checked={(drill.terrainTypes ?? []).includes(t.id)}
						onchange={(e) => toggleDrillTerrain(d.id, t.id, e.currentTarget.checked)}
					/>
					{t.name}
				</label>
			{/each}
		</fieldset>
		<label>
			Purpose
			<textarea
				rows="2"
				value={drill.purpose}
				oninput={(e) => setDrillField(d.id, 'purpose', e.currentTarget.value)}
			></textarea>
		</label>
		<label>
			Terrain
			<input
				value={drill.terrain}
				oninput={(e) => setDrillField(d.id, 'terrain', e.currentTarget.value)}
			/>
		</label>
		<label>
			How-to
			<textarea
				rows="3"
				value={drill.howTo}
				oninput={(e) => setDrillField(d.id, 'howTo', e.currentTarget.value)}
			></textarea>
		</label>
		<label>
			Cues (one per line)
			<textarea
				rows="3"
				value={drill.cues.join('\n')}
				oninput={(e) =>
					setDrillField(
						d.id,
						'cues',
						e.currentTarget.value
							.split('\n')
							.map((s) => s.trim())
							.filter(Boolean)
					)}
			></textarea>
		</label>
		<label>
			Watch for
			<textarea
				rows="2"
				value={drill.watchFor}
				oninput={(e) => setDrillField(d.id, 'watchFor', e.currentTarget.value)}
			></textarea>
		</label>
		<label>
			Easier <span class="muted">(optional)</span>
			<input
				value={drill.easier ?? ''}
				oninput={(e) => setDrillField(d.id, 'easier', e.currentTarget.value)}
			/>
		</label>
		<label>
			Harder <span class="muted">(optional)</span>
			<input
				value={drill.harder ?? ''}
				oninput={(e) => setDrillField(d.id, 'harder', e.currentTarget.value)}
			/>
		</label>
		<label>
			If it doesn't land <span class="muted">(optional)</span>
			<input
				value={drill.fallback ?? ''}
				oninput={(e) => setDrillField(d.id, 'fallback', e.currentTarget.value)}
			/>
		</label>
		<p class="muted">Seed trains: {d.trains.join(', ')}</p>
	</details>
{/each}

<h2>Terrain types</h2>
<p class="muted">
	The canonical terrain taxonomy used by the drill filter. Drills reference these
	by id — removing a type doesn't yet update the drills that point at it
	(see parking lot #1). IDs are fixed once created.
</p>
{#each terrainRows as row, i (row.id)}
	<div class="card">
		<h3>{row.id}</h3>
		<label>
			Name
			<input bind:value={row.name} />
		</label>
		<label>
			Description
			<textarea rows="2" bind:value={row.description}></textarea>
		</label>
		<button class="linklike" onclick={() => removeTerrainRow(i)}>Remove</button>
	</div>
{/each}
<button onclick={addTerrainRow}>+ Add terrain type</button>

<div class="actions">
	<button onclick={onSaveTerrainTypes}>Save terrain types</button>
	<button onclick={onResetTerrainTypes}>Reset to seed data</button>
	<button onclick={() => download('terrain-types.json', content.exportTerrainTypesJson())}
		>Export terrain-types.json</button
	>
	{#if terrainSavedFlash}<span class="muted">Saved ✓</span>{/if}
</div>

<div class="actions">
	<button onclick={onSave}>Save all changes</button>
	<button onclick={onReset}>Reset all to seed data</button>
	<button onclick={() => download('skills.json', content.exportSkillsJson())}
		>Export skills.json</button
	>
	<button onclick={() => download('drills.json', content.exportDrillsJson())}
		>Export drills.json</button
	>
	{#if savedFlash}<span class="muted">Saved ✓</span>{/if}
</div>

<h2>Publish to GitHub</h2>
<p class="muted">
	Commits the current seed content straight to the repo — the deploy workflow
	rebuilds automatically. Needs a fine-grained personal access token: GitHub →
	Settings → Developer settings → Fine-grained tokens → Generate new token, scoped
	to repository <code>dfaourgatech/SkiSchoolApp</code> only, with
	<strong>Contents: Read and write</strong>. The token stays in this browser's
	localStorage and is only ever sent to api.github.com. Note: this writes the JSON
	seeds directly — the <code>.md</code> source files won't reflect these edits.
</p>
{#if ghConnected}
	<p>
		Connected{#if ghUser} as <strong>{ghUser}</strong>{/if}
		<button class="linklike" onclick={onDisconnect}>Disconnect</button>
	</p>
	<button
		onclick={onPublish}
		disabled={publishState === 'publishing' ||
			(Object.keys(overrides).length === 0 &&
				Object.keys(skillOverrides).length === 0 &&
				Object.keys(drillOverrides).length === 0 &&
				terrainTypeList.types === null)}
	>
		{publishState === 'publishing'
			? 'Publishing…'
			: publishState === 'done'
				? 'Published ✓'
				: 'Save & publish to repo'}
	</button>
	{#if ghError}<p class="error">{ghError}</p>{/if}
{:else}
	<label>
		Personal access token
		<input
			type="password"
			bind:value={tokenInput}
			placeholder="github_pat_…"
			autocomplete="off"
		/>
	</label>
	<button onclick={onConnect} disabled={ghBusy || !tokenInput.trim()}>
		{ghBusy ? 'Checking…' : 'Connect'}
	</button>
	{#if ghError}<p class="error">{ghError}</p>{/if}
{/if}

<p><a href="{base}/">← Back to app</a></p>

<style>
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		margin: 1.5rem 0;
	}
	label {
		display: block;
		margin: 0.75rem 0;
	}
	input,
	textarea {
		display: block;
		width: 100%;
		margin-top: 0.25rem;
		padding: 0.5rem;
		font: inherit;
	}
	.error {
		color: #b3261e;
	}
</style>
