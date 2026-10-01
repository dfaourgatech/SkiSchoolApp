<script>
	import '../app.css';
	import { base } from '$app/paths';
	let { children } = $props();
</script>

<header class="app-header">
	<nav>
		<a class="brand" href="{base}/">⛷ SkiCoach</a>
		<a href="{base}/drills">Drills</a>
		<a href="{base}/terrain">Terrain</a>
	</nav>
</header>
<main>
	{@render children()}
</main>
