const fs = require('fs');
const path = require('path'); // Importante para lidar com caminhos

(async () => {
  const years = [];
  for (let year = 2014; year <= 2025; year++) {
    years.push(year);
  }

  // Use caminhos relativos. O '.' indica a pasta onde o script está.
  // Se a pasta 'public' estiver no mesmo nível de temp.js:
  const baseDir = path.join(__dirname, 'public', 'data');

  const result = {};
  const cumulativeSums = {};

  for (const year of years) {
    const fileName = `ESTATISTICAS_NATUREZAS_${year}.json`;
    const filePath = path.join(baseDir, fileName);

    console.log(`Lendo dados do ano ${year} em: ${filePath}`);

    try {
      // Substituímos o fetch por fs.readFileSync ou fs.promises.readFile
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${fileName}`);
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      let records = data;
      if (Array.isArray(data) && data.length === 1 && Array.isArray(data[0])) {
        records = data[0];
      }

      for (const item of records) {
        const nature = item['DSC_NAT_OCORRENCIA'];
        const qty = parseInt(item['QTD_REGISTROS']);

        if (!result[nature]) {
          result[nature] = {};
          cumulativeSums[nature] = 0;
        }

        cumulativeSums[nature] += qty;
        result[nature][year] = cumulativeSums[nature].toString();
      }
    } catch (error) {
      console.error(`Erro ao processar ano ${year}:`, error.message);
    }
  }

  const outputFileName = 'concatenated_cumulative_data.json';
  fs.writeFileSync(outputFileName, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Sucesso! Resultado em: ${outputFileName}`);
})();