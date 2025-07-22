import fs from 'fs';
import path from 'path';
import { Worker } from 'worker_threads';

const image_directory = 'public/images';
const model_directory = await fs.promises.readdir("./glTF-Sample-Assets/Models", { withFileTypes: true });

const ModelList = await fetch("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/refs/heads/main/Models/model-index.json").then(res => res.json()).catch(e => {return []});
const ModelMap = {};
ModelList.forEach(item => {
  ModelMap[item.name] = item;
});

console.log(ModelList.length);

fs.rmSync(image_directory, { recursive: true, force: true });

const tasks = [];
await (async () => {
  for await (const dir of model_directory.filter((e,i) => i>=0)) {
    if(!dir.isDirectory()) continue;

    const name = dir.name;
    const folderpath = `Models/${name}`;
    console.log("Model", name);

    const model = ModelMap[name];
    if(model == null) 
    {
      console.log("Cannot find ", name)
      continue;
    }
    if(model.screenshot == null)
    {
      console.log("Cannot find screenshot", name);
      continue;
    }

    const screenshot = model && model.screenshot && `glTF-Sample-Assets/${folderpath}/${model.screenshot}`;

    const tgt_file = image_directory + '/' + name + "/" + model.screenshot;
    const tgt_directory = path.dirname(tgt_file);
    const filename = path.basename(screenshot, path.extname(screenshot));
    tasks.push({
      src: screenshot,
      tgt_thumb: tgt_directory + '/' + filename + '.thumb' + '.webp',
      tgt_original: tgt_file,
      tgt_dir: tgt_directory,
      name: filename
    });
  }
})();

// Function to run a task in a worker
function runWorker(filePath, workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(filePath, { workerData });

    worker.on('message', resolve);  // Resolve the promise with the worker's result
    worker.on('error', reject);    // Reject the promise if the worker encounters an error
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// Main function to start multiple workers
async function runTasks() {
  const workers = tasks.map((task) =>
    runWorker('./src/scripts/thumbnail_worker.mjs', task)
  );

  const results = await Promise.all(workers);
  return results;
}

await runTasks().catch((err) => console.error(err));