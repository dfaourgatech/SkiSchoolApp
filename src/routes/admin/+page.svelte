<script lang="ts">
	import { base } from '$app/paths';
	import { skills } from '$lib/data';
	import {
		overrides,
		saveOverrides,
		resetOverrides,
		content
	} from '$lib/content.svelte';

	const fundamentals = skills.skills.flatMap((s) => s.fundamentals);

	let savedFlash = $state(false);

	function setOverride(id: string, field: 'name' | 'description', value: string) {
		if (!overrides[id]) overrides[id] = {};
		overrides[id][field] = value;
	}

	function onSave() {
		for (const [id, o] of Object.entries(overrides)) {
			if (!o.name?.trim() && !o.description?.trim()) delete overrides[id];
		}
		saveOverrides();
		savedFlash = true;
		setTimeout(() => (savedFlash = false), 2500);
	}

	function onExport() {
		const blob = new Blob([content.exportSkillsJson()], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'skills.json';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<h1>Content admin</h1>
<p class="muted">
	Edit the label and description for each fundamental. <strong>Save</strong> stores
	your edits in this browser and they apply across the app immediately.
	<strong>Export JSON</strong> downloads an updated <code>skills.json</code> —
	commit that file to make the change permanent and keep the versioned seed
	pipeline as the source of truth.
</p>

{#each fundamentals as f (f.id)}
	<div class="card">
		<h2>{f.id}</h2>
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

<div class="actions">
	<button onclick={onSave}>Save</button>
	<button onclick={resetOverrides}>Reset to seed data</button>
	<button onclick={onExport}>Export skills.json</button>
	{#if savedFlash}<span class="muted">Saved ✓</span>{/if}
</div>

<p><a href="{base}/">← Back to app</a></p>

<style>
	.actions {
		display: flex;
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
</style>
