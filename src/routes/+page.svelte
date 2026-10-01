<script>
	import { base } from '$app/paths';
	import { drills, terrain } from '$lib/data';
	import { content } from '$lib/content.svelte';
	const skills = $derived(content.skillsView);
</script>

<h1>Ski School Coaching App</h1>
<p class="muted">
	Pilot scaffold — {terrain.resort.name}. Offline-first PWA: everything below ships in the
	app bundle and works with no signal.
</p>

<div class="grid">
	<div class="card">
		<h2>📚 Drill library</h2>
		<p>
			{drills.drills.length} seed drills tagged to the PSIA skills taxonomy — each with
			purpose, how-to, cues, watch-fors, and fallbacks.
		</p>
		<a href="{base}/drills">Browse drills →</a>
	</div>
	<div class="card">
		<h2>🗺 Terrain &amp; gates</h2>
		<p>
			{terrain.gates.length} progression gates for {terrain.resort.name} — skill,
			route-completion, safety, and awareness gates, plus {terrain.alerts.length} instructor
			alerts.
		</p>
		<a href="{base}/terrain">View terrain →</a>
	</div>
	<div class="card">
		<h2>🎯 Skills framework</h2>
		<p>
			{skills.levels.length} level bands (L1–L4) over {skills.skills.length} PSIA skills
			({skills.skills
				.flatMap((s) => s.fundamentals)
				.map((f) => f.name)
				.join(', ')}).
		</p>
		<p class="muted">{skills.source}</p>
		<a href="{base}/fundamentals">The five fundamentals →</a>
	</div>
</div>

<div class="card">
	<h3>Content pipeline</h3>
	<p class="muted">
		Seed data is versioned JSON in <code>src/lib/data/</code>, generated from the
		human-reviewed <code>.md</code> seeds. The .md files stay the source of truth — nothing
		LLM-generated goes live without instructor review.
	</p>
</div>
