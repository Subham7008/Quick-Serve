const mongoose = require('mongoose');
require('dotenv').config();

// Database connection URL - hardcoded for this script
const DB_URL = 'mongodb://127.0.0.1:27017/quickservedatabase';

// Connect to MongoDB
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  updateRecords();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Import the models
const Device = require('../models/devices.model');
const ServiceRequest = require('../models/service_requests.model');

// Function to update all records
async function updateRecords() {
  try {
    console.log('Updating device and service request records...');
    
    // Update devices
    await updateDevices();
    
    // Update service requests
    await updateServiceRequests();
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating records:', error);
    process.exit(1);
  }
}

// Function to update devices
async function updateDevices() {
  try {
    console.log('Updating device records...');
    
    // Find all devices
    const devices = await Device.find({});
    
    console.log(`Found ${devices.length} total devices`);
    
    if (devices.length === 0) {
      console.log('No devices found in the database.');
      return;
    }
    
    // Print sample device 
    if (devices.length > 0) {
      console.log('Sample device:', JSON.stringify(devices[0].toObject(), null, 2));
    }
    
    // Update each device
    let updatedCount = 0;
    for (const device of devices) {
      const hadNoSerial = !device.serial_number;
      const hadNoServiceType = !device.service_type;
      
      device.serial_number = device.serial_number || '';
      device.service_type = device.service_type || '';
      
      if (hadNoSerial || hadNoServiceType) {
        await device.save();
        updatedCount++;
        console.log(`Updated device ${device._id}`);
      }
    }
    
    console.log(`Updated ${updatedCount} devices out of ${devices.length} total devices`);
    console.log('Device update complete!');
  } catch (error) {
    console.error('Error updating devices:', error);
    throw error;
  }
}

// Function to update service requests
async function updateServiceRequests() {
  try {
    console.log('Updating service request records...');
    
    // Find all service requests
    const serviceRequests = await ServiceRequest.find({});
    
    console.log(`Found ${serviceRequests.length} total service requests`);
    
    if (serviceRequests.length === 0) {
      console.log('No service requests found in the database.');
      return;
    }
    
    // Print sample service request
    if (serviceRequests.length > 0) {
      console.log('Sample service request deviceDetails:', 
                 JSON.stringify(serviceRequests[0].deviceDetails, null, 2));
    }
    
    // Use direct mongo update to avoid validation issues
    const result = await ServiceRequest.collection.updateMany(
      { "deviceDetails.serial_number": { $exists: false } },
      { $set: { "deviceDetails.serial_number": "" } }
    );
    
    console.log(`Updated ${result.modifiedCount} service requests to add serial_number`);
    
    const result2 = await ServiceRequest.collection.updateMany(
      { "deviceDetails.service_type": { $exists: false } },
      { $set: { "deviceDetails.service_type": "" } }
    );
    
    console.log(`Updated ${result2.modifiedCount} service requests to add service_type`);
    console.log('Service request update complete!');
  } catch (error) {
    console.error('Error updating service requests:', error);
    throw error;
  }
} 