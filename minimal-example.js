#!/usr/bin/env node
import XTTSv2JS from 'xtts-v2-js';
import fs from 'fs';

// Create client
const client = new XTTSv2JS();

// Generate speech with voice cloning
const audio = await client.generateSpeech(
    'Hello! This is a minimal example of XTTS-v2-JS.',
    './reference.wav',  // Path to reference audio (required)
    'en'                // Language code
);

// Save to file
fs.writeFileSync('output.wav', audio);
console.log('✓ Audio saved to output.wav');

