<script>
	import { drills, skills } from '$lib/data';

	let maxLevel = $state(4);
	const filtered = $derived(drills.drills.filter((d) => d.levelMin <= maxLevel));
	const fundamentalNames = $derived(
		new Map(skills.skills.flatMap((s) => s.fundamentals).map((f) => [f.id, f.name]))
	);
</script>

<h1>Drill library</h1>
<p class="muted">{drills.drills.length} seed drills · {drills.source}</p>

<label>
	Show drills for levels up to:
	<select bind:value={maxLevel}>
		<option value={1}>L1</option>
		<option value={2}>L2</option>
		<option value={3}>L3</option>
		<option value={4}>L4</option>
	</select>
</label>

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
