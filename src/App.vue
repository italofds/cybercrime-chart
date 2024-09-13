<template>
	
	<div class="container">
		<div class="row">
			<!-- Coluna da esquerda (2024 centralizado) -->
			<div class="col-auto vh-100 position-sticky top-0 d-flex justify-content-center align-items-center">
				<div class="card shadow-sm m-5" style="width: 300px;">
					<div class="card-body d-flex justify-content-center align-items-center">
						<button type="button" class="btn btn-lg btn-light me-3" @click="prevYear"><i class="bi bi-arrow-left"></i></button>
						<span class="h1">{{ year }}</span>
						<button type="button" class="btn btn-lg btn-light ms-3" @click="nextYear"><i class="bi bi-arrow-right"></i></button>
					</div>
				</div>
			</div>
			<!-- Coluna da direita (conteúdo com rolagem) -->
			<div class="col right-column p-5">
				<h3 class="mb-5 text-center">Top 50 Naturezas Mais Registradas</h3>
				<div style="height: 1500px">
					<canvas id="racingBarChart"></canvas>
				</div>				
			</div>
		</div>
	</div>
	
	
</template>

<script>

import Chart from "chart.js/auto"

const FIRST_YEAR = 2013;
const LAST_YEAR = 2023;

const naturezasExcluidas = [
"EM APURACAO",
"TRÂNSITO - ACIDENTE DE TRANSITO SEM VITIMA",
"EXTRAVIO",
"CUMPRIMENTO DE MANDADO DE PRISÃO - Criminal",
"ACIDENTE DE TRANSITO SEM VITIMA"
];

const naturezasDestaque = [
"ESTELIONATO",
"FURTO MEDIANTE FRAUDE",
"INVASÃO DE DISPOSITIVO INFORMÁTICO (L.12737/12) ",
"CRIMES PRATICADOS PELA INTERNET",
"FALSA IDENTIDADE",
"POSSIVEL TENTATIVA DE ESTELIONATO"
];

export default {
	name: 'App',
	data() {
		this.chart = null;
		return {
			year: FIRST_YEAR,
			occurrencesByYear: null
		}
	},
	computed: {
		topOccurrences: function () {
			if (this.occurrencesByYear) {
				return this.occurrencesByYear[this.year].slice(0, 50);
			}
			return null;
		},
		labels: function () {
			if (this.topOccurrences) {
				return this.topOccurrences.map(item => item.descricao);
			}
			return null;
		},
		shortLabels: function () {
			if (this.topOccurrences) {
				return this.topOccurrences.map((item, index) => `${index+1} - ${shortText(item.descricao)}`);
			}
			return null;
		},
		data: function () {
			if (this.topOccurrences) {
				return this.topOccurrences.map(item => item.registros);
			}
			return null;
		},
		backgroundColors: function () {
			if (this.labels) {
				const result = this.labels.map(label => {
					if (naturezasDestaque.includes(label)) {
						return 'rgba(255, 99, 132, 0.7)';
					}
					return 'rgba(54, 162, 235, 0.7)';
				});
				return result;
			}
			return null;
		},
	},
	methods: {
		nextYear() {
			this.year++;
			if(this.year > LAST_YEAR) {
				this.year = FIRST_YEAR;
			}
			this.updateChart();
		},
		prevYear() {
			this.year--;
			if(this.year < FIRST_YEAR) {
				this.year = LAST_YEAR;
			}
			this.updateChart();
		},
		updateChart() {
			if(this.chart) {
				this.chart.data.labels = this.shortLabels;
				this.chart.data.datasets[0].data = this.data;
				this.chart.data.datasets[0].backgroundColor = this.backgroundColors;
				this.chart.data.datasets[0].borderColor = this.backgroundColors;
				this.chart.update();
			}
			
		},
		createChart(){			
			const ctx = document.getElementById('racingBarChart').getContext('2d');			
			this.chart = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: this.shortLabels,
					datasets: [{
						data: this.data,
						backgroundColor: this.backgroundColors,
						borderColor: this.backgroundColors,
						borderWidth: 1
					}]
				},
				options: {
					maintainAspectRatio: false,
					indexAxis: 'y',
					scales: {
						x: {
							position: 'top',
							max: 100000
						}
					},
					plugins: {
						legend: {
							display: false
						}
					},
					animation: {
						duration: 1000,
						easing: 'linear'
					}
				}
			});
		}
	},
	async mounted() {
		this.occurrencesByYear = await aggregateData();		
		this.createChart();
	}
}

function shortText(text) {
	if(text.length > 25) {
		return text.slice(0, 23) + "...";
	}	
	return text;
}


async function loadJSON(year) {
	const response = await fetch(`./data/ESTATISTICAS_NATUREZAS_${year}.json`);
	return response.json();
}

async function aggregateData() {
	const occurrencesByYear = {};
	
	for (let year = 2013; year <= 2023; year++) {
		const data = await loadJSON(year);
		data[0].forEach(ocorrencia => {
			const descricao = ocorrencia.DSC_NAT_OCORRENCIA;
			const registros = ocorrencia.QTD_REGISTROS;
			
			if (naturezasExcluidas.includes(descricao)) {
				return;
			}
			
			if (!occurrencesByYear[year]) {
				occurrencesByYear[year] = [];
			}
			
			occurrencesByYear[year].push({
				descricao,
				registros
			});
		});
		
		occurrencesByYear[year].sort((a, b) => b.registros - a.registros);
	}
	
	return occurrencesByYear;
}
</script>

<style>
html, body {
	width: 100%;
	height: 100%;
}
</style>