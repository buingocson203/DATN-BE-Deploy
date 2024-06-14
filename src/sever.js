import { connect } from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import router from './routes/index.js';
const app = express();
dotenv.config();
const PORT = process.env.PORT;
const URI_DB = process.env.URI_DB;
app.use(cors());
connect(URI_DB)
	.then(() => {
		console.log('Connected to the database');
	})
	.catch((err) => {
		console.log('Error connecting to the database', err);
	});
app.use(express.json());
app.use('/api', router);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
