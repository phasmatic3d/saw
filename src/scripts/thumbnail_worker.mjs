import { parentPort, workerData } from 'worker_threads';
import fs from 'fs';
import sharp from 'sharp';

// Simulate a time-consuming task
const result = workerData; // Example task: double the input

try {
  fs.mkdirSync(workerData.tgt_dir, { recursive: true });
  fs.cpSync(workerData.src, workerData.tgt_original)
  console.log(`Directory ${workerData.tgt_dir} created successfully!`);
} catch (err) {
  console.error('Error creating directory:', err);
}

await sharp(workerData.src)
  .resize(512)
  .webp({quality: 90})
  .toFile(workerData.tgt_thumb, (err) => {
    if (err) {
      console.log('Error processing image:', workerData.tgt_thumb);
    } else {
      console.log('Image successfully saved:', workerData.tgt_thumb);
    }
});

parentPort.postMessage(result); // Send the result back to the main thread