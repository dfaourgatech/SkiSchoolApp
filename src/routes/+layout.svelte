<script>
	import '../app.css';
	let { children } = $props();
</script>

<header class="app-header">
	<nav>
		<a class="brand" href="/">⛷ SkiCoach</a>
		<a href="/drills">Drills</a>
		<a href="/terrain">Terrain</a>
	</nav>
</header>
<main>
	{@render children()}
</main>
