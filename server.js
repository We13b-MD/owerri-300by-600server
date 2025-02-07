const express = require('express')
const app = express()
const fs = require('fs')
const cors = require('cors')
app.use(cors())
app.use(express.json())
const filepath = 'tracking.json'
const rateLimit = require('express-rate-limit')

const trackingLimiter = rateLimit({
    windowMs:10*1000,
    max:1,
    message:{message:"Too many requests,Please try again later"}

})
let trackingData = []
try{
    if(fs.existsSync(filepath)){
        trackData = JSON.parse(fs.readFileSync)
    }
}catch(error){
    console.error('Error reading JSON file:',error)
}

function trackData(imp, clicks) {
    const today = new Date().toISOString().split('T')[0]; // Format: "YYYY-MM-DD"
    
    let existingRecord = trackingData.find(record => record.date === today);

    if (existingRecord) {
        // Update today's record
        existingRecord.impressions;
        existingRecord.clicks;
    } else {
        // Create new daily record
        trackingData.push({
            date: today,
            impressions: imp,
            clicks: clicks
        });
    }
    try {
        const jsonData = JSON.stringify(trackingData, null, 2);
        if (!jsonData) throw new Error("JSON.stringify returned undefined");

        fs.writeFileSync(filepath, jsonData, 'utf8'); // Ensure valid JSON is written
       
    } catch (error) {
        console.error("❌ Error writing JSON file:", error);
    }
}

app.post('/api/track', trackingLimiter, (req, res) => {
    const { imp, clicks } = req.body;
    console.log('incoming data:',req.body)
    
    if (typeof imp !== 'number' || typeof clicks !== 'number') {
        return res.status(400).json({ message: 'Invalid data format' });
    }
    trackData(imp, clicks); // Ensures daily accumulation

    
    
    res.json({ message: 'Data received successfully!' });
});


app.get('/', (req, res) => {
   
    let tableRows = trackingData.map(row => `
        <tr>
            <td>${row.date}</td>
            <td>${row.impressions}</td>
            <td>${row.clicks}</td>
        </tr>
    `).join('');

    let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tracking Data</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f4f4f4; }
                table { width: 80%; margin: auto; border-collapse: collapse; background: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                th, td { padding: 10px; border: 1px solid #ddd; }
                th { background: #333; color: #fff; }
                tr:nth-child(even) { background: #f9f9f9; }
            </style>
        </head>
        <body>
            <h2>Tracking Data</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Impressions</th>
                        <th>Clicks</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>
    `;

    res.send(html);
});

app.listen(8000, () => {
    console.log('Server running at http://localhost:8000');
  })