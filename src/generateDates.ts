import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the folder containing the JSON files
const dataFolder: string = path.join(__dirname, "data");
// Path to the output file for the available dates
const outputFilePath: string = path.join(__dirname, "dates.json");

// Function to generate dates.json
const generateDatesJson = (): void => {
  try {
    // Read the contents of the data folder
    const files: string[] = fs.readdirSync(dataFolder);

    // Filter out files that are not JSON and extract the date part of the filename
    const dates: string[] = files
      .filter((file) => path.extname(file) === ".json")
      .map((file) => path.basename(file, ".json"));

    // Write the dates array to dates.json
    fs.writeFileSync(outputFilePath, JSON.stringify(dates, null, 2));

    console.log(
      `Successfully generated dates.json with ${dates.length} dates.`
    );
  } catch (error) {
    console.error("Error generating dates.json:", error);
  }
};

// Run the function
generateDatesJson();
