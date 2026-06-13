require('dotenv').config();
const express = require('express');
const cors = require('cors');
const vehiclesRouter = require('./routes/vehicles');
const driversRouter = require('./routes/drivers');
const alertsRouter = require('./routes/alerts');
const tripsRouter = require('./routes/trips');
const authRouter = require('./routes/auth');
const maintenanceRouter = require('./routes/maintenance');
const fuelRouter = require('./routes/fuel');
const incidentsRouter = require('./routes/incidents');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/vehicles', vehiclesRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/auth', authRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/fuel', fuelRouter);
app.use('/api/incidents', incidentsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Fleet Management API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});