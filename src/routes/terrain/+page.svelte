<script>
	import { terrain } from '$lib/data';
</script>

<h1>{terrain.resort.name} — terrain &amp; gates</h1>
<p class="muted">{terrain.reviewStatus}</p>

<h2>Progression gates</h2>
<p class="muted">
	Don't route a group to the lift/terrain until the gate is met. Gate kinds: skill,
	route-completion, safety (bailout lever), awareness.
</p>
<table class="gates">
	<thead>
		<tr>
			<th>Lift / terrain</th>
			<th>Don't go until…</th>
			<th>Kind</th>
		</tr>
	</thead>
	<tbody>
		{#each terrain.gates as gate (gate.id)}
			<tr>
				<td><strong>{gate.liftOrTerrain}</strong></td>
				<td>
					{gate.requirement}
					<br /><span class="muted">{gate.why}</span>
				</td>
				<td><span class="tag">{gate.kind}</span></td>
			</tr>
		{/each}
	</tbody>
</table>

<h2>Beginner lift progression</h2>
<ol>
	{#each terrain.liftProgression as step}
		<li>{step}</li>
	{/each}
</ol>

<h2>Instructor alerts</h2>
{#each terrain.alerts as alert (alert.id)}
	<div class="card">
		<h3>⚠ {alert.title}</h3>
		<p>{alert.detail}</p>
		<p class="muted">Applies to levels {alert.appliesToLevels.join(', ')}</p>
	</div>
{/each}

<h2>Navigation</h2>
{#each terrain.navNotes as nav}
	<div class="card">
		<h3>{nav.route}</h3>
		<ol>
			{#each nav.steps as step}
				<li>{step}</li>
			{/each}
		</ol>
	</div>
{/each}

<h2>Reference</h2>
<div class="card">
	<p><strong>Snowmaking (reliable early/late season):</strong> {terrain.snowmaking.join(', ')}</p>
	<p><strong>Family slow zones:</strong> {terrain.familySlowZones.join('; ')}</p>
	<p class="muted">{terrain.slowZoneNote}</p>
</div>
