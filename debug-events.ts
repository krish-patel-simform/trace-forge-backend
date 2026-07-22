import mongoose from 'mongoose';
import { Event } from './src/models/event.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkEvents() {
  await mongoose.connect(process.env.MONGO_DB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/traceforge');
  
  const clicks = await Event.find({ eventType: 'click' }).lean();
  console.log('--- CLICKS ---');
  console.log(JSON.stringify(clicks, null, 2));

  const customs = await Event.find({ eventType: 'custom' }).lean();
  console.log('--- CUSTOM EVENTS ---');
  console.log(JSON.stringify(customs, null, 2));

  await mongoose.disconnect();
}

checkEvents().catch(console.error);
