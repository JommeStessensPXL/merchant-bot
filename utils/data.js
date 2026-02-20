const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../lobby_data.json');

function loadData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const rawData = fs.readFileSync(DATA_FILE);
            return JSON.parse(rawData);
        }
    } catch (error) {
        console.error('Fout bij laden data:', error);
    }
    return {};
}

function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fout bij opslaan data:', error);
    }
}

module.exports = { loadData, saveData };