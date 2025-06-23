# Sample Asset Website

This Repository is a curated collection of glTF models that illustrate one or more features or capabilities of glTF. This [Sample Assets website](https://github.com/KhronosGroup/glTF-Sample-Assets) demonstrates where we are on that path to convergence and highlights areas that could still use improvement. 

## Getting Started

This webpage was built using [Next.js](https://nextjs.org).

To start developing, first clone this repo. This will download the code and data from the repository and submodules. The LFS Git extension is necessary in order to handle large files.

Then install the node packages using 
```bash 
npm install
``` 

and run the development server using 
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

## Security 

As of commit [`be33293c`](https://github.com/KhronosGroup/glTF-Render-Fidelity/commit/be3329cf5b13349ca946c9fc60de98be4cd64e75), this repository has one reported vulnerability that have been automatically detected by GitHub's Dependabot. 

- [CVE-2025-27789](https://nvd.nist.gov/vuln/detail/CVE-2025-27789) concerns runtime complexity and does not affect the Render Fidelity website.

Future work on this repository will completely address these issues by updating the dependencies.

