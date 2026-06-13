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
const jobcardsRouter = require('./routes/jobcards');
const inspectionsRouter = require('./routes/inspections');
const poolbookingsRouter = require('./routes/poolbookings');
const vendorsRouter = require('./routes/vendors');
const documentsRouter = require('./routes/documents');
const scheduledreportsRouter = require('./routes/scheduledreports');
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
app.use('/api/jobcards', jobcardsRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/poolbookings', poolbookingsRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/scheduledreports', scheduledreportsRouter);
app.get('/', (req, res) => {
  res.json({ message: 'Fleet Management API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});