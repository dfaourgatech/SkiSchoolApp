<script lang="ts">
	import { drills } from '$lib/data';
	import { content } from '$lib/content.svelte';

	let maxLevel = $state(4);
	let selectedFundamentals = $state<string[]>([]);
	let selectedTerrains = $state<string[]>([]);
	const drillData = $derived(content.drillsView);
	const filtered = $derived(
		drillData.drills.filter(
			(d) =>
				d.levelMin <= maxLevel &&
				(selectedFundamentals.length === 0 ||
					d.trains.some((t) => selectedFundamentals.includes(t))) &&
				(selectedTerrains.length === 0 ||
					d.terrainTypes.some((t) => selectedTerrains.includes(t)))
		)
	);
	const fundamentalNames = $derived(
		new Map(content.fundamentals.map((f) => [f.id, f.name]))
	);

	function toggleFundamental(id: string, checked: boolean) {
		selectedFundamentals = checked
			? [...selectedFundamentals, id]
			: selectedFundamentals.filter((x) => x !== id);
	}

	function toggleTerrain(id: string, checked: boolean) {
		selectedTerrains = checked
			? [...selectedTerrains, id]
			: selectedTerrains.filter((x) => x !== id);
	}
</script>

<h1>Drill library</h1>
<p class="muted">{drillData.drills.length} seed drills · {drillData.source}</p>

<label>
	Show drills for levels up to:
	<select bind:value={maxLevel}>
		<option value={1}>L1</option>
		<option value={2}>L2</option>
		<option value={3}>L3</option>
		<option value={4}>L4</option>
	</select>
</label>

<details class="card filters">
	<summary>
		Filter by fundamental{selectedFundamentals.length > 0
			? ` (${selectedFundamentals.length} selected)`
			: ''}
	</summary>
	<fieldset>
		<legend>Show drills for fundamentals:</legend>
	{#each content.fundamentals as f (f.id)}
		<label class="check">
			<input
				type="checkbox"
				checked={selectedFundamentals.includes(f.id)}
				onchange={(e) => toggleFundamental(f.id, e.currentTarget.checked)}
			/>
			{f.name}
		</label>
	{/each}
	{#if selectedFundamentals.length > 0}
		<button class="linklike" onclick={() => (selectedFundamentals = [])}>Clear</button>
	{/if}
	</fieldset>
</details>

<details class="card filters">
	<summary>
		Filter by terrain{selectedTerrains.length > 0
			? ` (${selectedTerrains.length} selected)`
			: ''}
	</summary>
	<fieldset>
		<legend>Show drills for terrain types:</legend>
	{#each content.terrainTypes as t (t.id)}
		<label class="check">
			<input
				type="checkbox"
				checked={selectedTerrains.includes(t.id)}
				onchange={(e) => toggleTerrain(t.id, e.currentTarget.checked)}
			/>
			{t.name}
		</label>
	{/each}
	{#if selectedTerrains.length > 0}
		<button class="linklike" onclick={() => (selectedTerrains = [])}>Clear</button>
	{/if}
	</fieldset>
</details>

<p class="muted">
	Showing {filtered.length} of {drillData.drills.length} drills
</p>

{#each filtered as drill (drill.id)}
	<details class="card">
		<summary>
			{drill.id} — {drill.name}
			<span class="tag">L{drill.levelLabel}</span>
			{#each drill.trains as t}
				<span class="tag">{fundamentalNames.get(t) ?? t}</span>
			{/each}
		</summary>
		<p><strong>Purpose:</strong> {drill.purpose}</p>
		<p><strong>Terrain:</strong> {drill.terrain}</p>
		<p><strong>How-to:</strong> {drill.howTo}</p>
		<p><strong>Cues:</strong> {drill.cues.join(' · ')}</p>
		<p><strong>Watch for:</strong> {drill.watchFor}</p>
		{#if drill.progression}
			<p><strong>Progression:</strong> {drill.progression}</p>
		{/if}
		<p class="muted">
			{#if drill.easier}<strong>Easier:</strong> {drill.easier} · {/if}
			{#if drill.harder}<strong>Harder:</strong> {drill.harder} · {/if}
			{#if drill.fallback}<strong>If it doesn't land:</strong> {drill.fallback}{/if}
		</p>
	</details>
{/each}

<h2>Cause → effect (diagnosis seed)</h2>
{#each drills.causeEffect as ce}
	<div class="card">
		<p><strong>Student feels:</strong> {ce.internalCue}</p>
		<p><strong>Instructor sees:</strong> {ce.externalCue}</p>
		<p>
			<strong>Likely cause:</strong> {ce.likelyCause} →
			<strong>Try:</strong> {ce.tryDrills.join(', ')}
		</p>
	</div>
{/each}
