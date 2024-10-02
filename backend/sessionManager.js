const fs = require('fs');
const path = require('path');

// Path to the JSON file that will store session-like data
const filePath = path.join(__dirname, 'sessionData.json');

// Utility function to read data from the JSON file
function readData() {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);  // Parse and return JSON data
    } catch (err) {
        // If file doesn't exist or there's an error, return default data
        return { year: null };
    }
}

// Utility function to write data to the JSON file
function writeData(data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing to file", err);
    }
}

// Export the read and write functions
module.exports = {
    readData,
    writeData
};
