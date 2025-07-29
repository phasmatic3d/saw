# Sample Asset Website

This [Sample Assets website](https://github.com/KhronosGroup/glTF-Sample-Assets) contains high quality examples of glTF content, that illustrate how many of the glTF extensions can be used to improve the visual quality of the 3D models. Many of the extensions implement physically based rendering (PBR) techniques which, if implemented correctly in a web browser, ensures visual interoperability (i.e. they look the same) an important feature in particular for 3D commerce where a customer wants the object to look "correct". The Sample Assets website provides a set of convenient content filters to enable you to locate assets of interest. 

## Getting Started

This webpage was built using [Next.js](https://nextjs.org).

To start developing, first clone this repo. This will download the code and data from the repository and submodules. The LFS Git extension is necessary in order to handle large files.

Then install the node packages using 
```bash 
npm install
``` 

Beware that `postinstall` command, executed by `npm install`, will fail to run on Windows PCs due to the missing `cp` command. Just copy all `*.wasm` files from `glTF-Sample-Renderer/dist/libs/*.wasm` to `glTF-Sample-Renderer/dist/` folder.

Finally, run the development server using 
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing by modifying the pages in the `app/` folder or their components in `components/` folder. The page auto-updates as you edit files.

To build the website use
```bash
npm run build
```

## Deploy

Push commits to the main branch and automatic actions on the repo will build and deploy the webpage.

## Update Website

To update the website with new or improved assets, you should follow the steps below.

### Image generation
Images for each new asset can be generated using `npm run generate` command. This will render and store an image for each asset, using the Khronos [glTF-Sample-Renderer](https://github.com/KhronosGroup/glTF-Sample-Renderer). In case the default camera does not sufficiently captures the asset, a new point of view can be specified in the `camera-props.SampleAssets.json` file by specifying the `"yaw", "pitch" and "zoom"` of the asset of interest.

### Keyword generation
Keywords are used to improve the search performance of the website. In case of a new asset, a new entry should be added to the `keywords.SampleAssets.json` file with a comma separated list of the keywords describing the new asset. The original keywords were created using the Llama 3.2 Vision module, where a screenshot of the asset was provided along with a query to generate the keywords (e.g. ''Please generate 20 unique keywords for the image. Place them, comma separated, inside [...]''). 

### Update metadata
If the metadata has changed, execute the command `npm run metadata`. This will read each asset metadata and keywords, and generates a JSON file containing all the available properties of each asset.

### Build 
The build process of the website, using GitHub actions, will automatically run and build the website using the new asset list and properties. 

## Security 

As of commit [`be33293c`](https://github.com/KhronosGroup/glTF-Render-Fidelity/commit/be3329cf5b13349ca946c9fc60de98be4cd64e75), this repository has one reported vulnerability that have been automatically detected by GitHub's Dependabot. 

- [CVE-2025-27789](https://nvd.nist.gov/vuln/detail/CVE-2025-27789) concerns runtime complexity and does not affect the Render Fidelity website.

Future work on this repository will completely address these issues by updating the dependencies.

