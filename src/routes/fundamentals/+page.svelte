<script lang="ts">
	import { base } from '$app/paths';
	import { content } from '$lib/content.svelte';

	const skills = $derived(content.skillsView);
</script>

<h1>The five fundamentals</h1>
<p class="muted">
	Every drill in the library trains one or more of the five PSIA Alpine
	fundamentals, grouped under the three skills: pressure, edging, and rotary.
	Names and descriptions are editable on the <a href="{base}/admin">admin page</a>.
</p>

{#each skills.skills as skill (skill.id)}
	<div class="card">
		<h2>{skill.name}</h2>
		<p>{skill.summary}</p>
		{#each skill.fundamentals as f (f.id)}
			<h3>{f.id} — {f.name}</h3>
			<p>{f.description}</p>
		{/each}
	</div>
{/each}

<p><a href="{base}/">← Back to app</a></p>
