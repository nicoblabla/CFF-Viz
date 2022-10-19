const express = require('express');
const api = require('./app.js');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/api/getTrains/:time', (req, res) => {
  res.json(api.getTrains(parseInt(req.params.time)));
});
app.get('/api/getStations', (req, res) => {
  res.json(api.getStations());
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});

