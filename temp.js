// Modified script to process JSON files from GitHub and generate a concatenated JSON with cumulative sums

const fs = require('fs');

(async () => {
  // Define the years to process
  const years = [];
  for (let year = 2014; year <= 2023; year++) {
    years.push(year);
  }

  // Replace the placeholders with your GitHub repository details
  const baseUrl = 'https://raw.githubusercontent.com/italofds/cybercrime-chart/refs/heads/main/public/data';

  // Data structure to accumulate the results
  const result = {};

  // For cumulative sums, we need to keep track of cumulative totals per nature
  const cumulativeSums = {};

  for (const year of years) {
    const fileName = `ESTATISTICAS_NATUREZAS_${year}.json`;
    const fileUrl = `${baseUrl}/${fileName}`;

    console.log(`Fetching data for year ${year} from ${fileUrl}`);

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${fileUrl}: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle data wrapped in double arrays [[...]]
      let records = data;
      if (Array.isArray(data) && data.length === 1 && Array.isArray(data[0])) {
        records = data[0];
      }

      // Process each record
      for (const item of records) {
        const nature = item['DSC_NAT_OCORRENCIA'];
        const qty = parseInt(item['QTD_REGISTROS']);

        if (!result[nature]) {
          result[nature] = {};
          cumulativeSums[nature] = 0;
        }

        // Update cumulative sum
        cumulativeSums[nature] += qty;

        // Store the cumulative quantity as a string
        result[nature][year] = cumulativeSums[nature].toString();
      }
    } catch (error) {
      console.error(`Error processing data for year ${year}:`, error);
    }
  }

  // Write the result to a JSON file
  const outputFileName = 'concatenated_cumulative_data.json';
  fs.writeFileSync(outputFileName, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Concatenated cumulative data written to ${outputFileName}`);
})();
