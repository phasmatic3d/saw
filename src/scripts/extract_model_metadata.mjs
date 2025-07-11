import fs from 'fs';
import path from 'path';
import { Worker } from 'worker_threads';
//import ModelList from "../../src/data/model-index.Khronos.json" with { type: "json" };

async function* getFiles(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    //const res = path.resolve(dir, dirent.name);
    const res = path.join(dir, dirent.name);
    
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

//const ModelList = await fetch("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/refs/heads/main/Models/model-index.json").then(res => res.json()).catch(e => {return []});
const ModelList = JSON.parse(await fs.promises.readFile(`./glTF-Sample-Assets/Models/model-index.json`, 'utf-8'));
const ModelTags = {};
const ModelMap = {};
ModelList.forEach(item => {
  ModelMap[item.name] = item;
});
const ModelMap2 = {};

//const model_directory = await fetch("https://api.github.com/repos/KhronosGroup/glTF-Sample-Assets/contents/Models").then(res => res.json()).catch(e => {return []});
const model_directory = await fs.promises.readdir("./glTF-Sample-Assets/Models", { withFileTypes: true });
const image_directory = '/images';

console.log("Dir #:", Object.keys(model_directory).length);

const keep_dict = {
  "showcase": "Showcase",
  "testing": "Testing",
  "extension": "Extension",
}

const ext_to_label = {
  "KHR_materials_transmission":  "Transmission",
  "KHR_materials_volume": "Volume",
  "KHR_materials_variants": "Variants",
  "KHR_materials_clearcoat": "Clearcoat",
  "KHR_materials_sheen": "Sheen",
  "KHR_materials_specular": "Specular",
  "KHR_materials_ior": "IOR",
  "KHR_materials_iridescence": "Iridescence",
  "KHR_materials_pbrSpecularGlossiness": "pbrSpecularGlossiness",
  "KHR_materials_emissive_strength": "Emissive",
  "KHR_materials_anisotropy": "Anisotropy",
  "KHR_materials_unlit": "Unlit",
  "KHR_lights_punctual": "Lights",
  "KHR_texture_transform": "Texture Transform",
  "KHR_xmp": "XMP",
  "EXT_texture_webp": "WebP"
};

await (async () => {
  for await (const dir of model_directory.filter((e,i) => i<99999)) {
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
    
    let metadata = null;
    let gltf = null;
    try {
      metadata = JSON.parse(await fs.promises.readFile(`./glTF-Sample-Assets/${folderpath}/metadata.json`, 'utf-8'));
      gltf = JSON.parse(await fs.promises.readFile(`./glTF-Sample-Assets/${folderpath}/glTF/${name}.gltf`, 'utf-8'));
    }
    catch(e)
    {
      console.log(e);
      continue;
    }
    //const metadata = JSON.parse(await fs.promises.readFile(`./glTF-Sample-Assets/${folderpath}/metadata.json`, 'utf-8'));
    //const gltf = JSON.parse(await fs.promises.readFile(`./glTF-Sample-Assets/${folderpath}/glTF/${name}.gltf`, 'utf-8'));
    const glb = model && model.variants && model.variants['glTF-Binary'];
    const glb_draco = model && model.variants && Object.keys(model.variants).find(variant => variant.includes('Draco'));
    const glb_meshopt = model && model.variants && model.variants['glTF-Quantized'];
    const glb_ktx = model && model.variants && Object.keys(model.variants).find(variant => variant.includes('KTX'));
    const screenshot = model && model.screenshot && `/glTF-Sample-Assets/${folderpath}/${model.screenshot}`;

    if(model && metadata && screenshot)
    {
      const name = encodeURIComponent(metadata.name.replace(/\s+/g, ''));
      const addTag = (tagMap, tag) => {
        if (tag in tagMap) {
          tagMap[tag]++;
        } else {
          tagMap[tag] = 1;
        }
      };
      ModelMap2[name] = {};
      ModelMap2[name].name = metadata.name.replace(/\s+/g, '');
      ModelMap2[name].label = metadata.name;
      ModelMap2[name].description = metadata.summary;
      ModelMap2[name].tags = [];
      for (const tag of metadata.tags.filter(tag => tag in keep_dict)) {
        ModelMap2[name].tags.push(keep_dict[tag]);
        addTag(ModelTags, keep_dict[tag]);
      }
      ModelMap2[name].variants = model && model.variants;
      ModelMap2[name].extensionsUsed = gltf? gltf.extensionsUsed : [];
      if(gltf && gltf.extensionsUsed) {
        for (const tag of ModelMap2[name].extensionsUsed) {
          addTag(ModelTags, ext_to_label[tag]);
          if (tag in ext_to_label) ModelMap2[name].tags.push(ext_to_label[tag]);
        }
      }
      let anim_found =false;
      let morph_found = false;
      if(gltf && gltf.animations) {
        addTag(ModelTags, "Animation");
        ModelMap2[name].tags.push("Animation");
        anim_found = true;
      }
      if(gltf && gltf.meshes) {
          for (const mesh of gltf.meshes) {
          if ("weights" in mesh && !anim_found) {
            addTag(ModelTags, "Animation");
            ModelMap2[name].tags.push("Animation");
            anim_found = true;
          }
          for (const prim of mesh.primitives) {
            if ("targets" in prim && !morph_found) {
              addTag(ModelTags, "Morphing");
              ModelMap2[name].tags.push("Morphing");
              morph_found = true;
              if (!anim_found) {
                addTag(ModelTags, "Animation");
                ModelMap2[name].tags.push("Animation");
                anim_found = true;
              }
            }
          }
        }
      }
      if(glb_draco) {
        const tag = "Draco";
        addTag(ModelTags, tag);
        ModelMap2[name].tags.push(tag);
      }
      if(glb_meshopt) {
        const tag = "Meshopt";
        addTag(ModelTags, tag);
        console.log("Hello");
        ModelMap2[name].tags.push(tag);
      }
      if(glb_ktx) {
        const tag = "KTX";
        addTag(ModelTags, tag);
        ModelMap2[name].tags.push(tag);
      }
      if(!(gltf && gltf.extensionsUsed) &&
         !glb_ktx &&
         !glb_meshopt &&
         !glb_draco) {
        const tag = "Core"; 
        addTag(ModelTags, tag);
        ModelMap2[name].tags.push(tag);
      }

      ModelMap2[name].downloadModel = glb? `https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/refs/heads/main/${folderpath}/glTF-Binary/${glb}` : undefined
      
      const tgt_file = image_directory + '/' + name + "/" + model.screenshot;
      const tgt_directory = path.dirname(tgt_file);
      const filename = path.basename(screenshot, path.extname(screenshot));
      
      ModelMap2[name].image = image_directory + '/' + name + "/" + model.screenshot;
      ModelMap2[name].thumbnail = tgt_directory + '/' + filename + '.thumb' + '.webp';
      //ModelMap2[name].thumbnail = `${tgt_directory}/${filename}.thumb.webp`;
    }   
  }
})();

console.log('ModelTags', ModelTags);

const TagList = {tags: []};
for (const tag in ModelTags) {
  TagList.tags.push(tag);
}

const jsonData = JSON.stringify(ModelMap2, null, 2); // The `null, 2` makes the output pretty-printed
fs.writeFileSync('src/data/model-index.SampleAssets.json', jsonData);

const jsonDataTagList = JSON.stringify(TagList, null, 2); // The `null, 2` makes the output pretty-printed
fs.writeFileSync('src/data/tags.json', jsonDataTagList);