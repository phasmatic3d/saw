"use client"
import React from 'react'
import Script from 'next/script'
import { Box, Button, IconButton, Paper, Checkbox, FormControlLabel, Switch, Typography, ButtonGroup, Select, FormControl, InputLabel, MenuItem  } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import normalizeWheel from 'normalize-wheel';

// Load the images
const loadImage = (src: string) =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = '';
    img.onload = () => resolve(img);
  }
);

export type Stats = {
  totalImagesFileSize: number
  numberOfVertices: number
  numberOfFaces: number,
  totalFileSize: number
}

export type ImageComparisonSliderProps = {
  src: string,
  imgSrc: string,
  statsCallback: (stats: Stats) => void
}

const orbit = {
  prev_mouse: [0,0],
  curr_mouse: [0,0],

  deltaPhi: 0,
  deltaTheta: 0,
  deltaZoom: 0,
  deltaX: 0,
  deltaY: 0
}

const handleMouseDown = (ev: React.MouseEvent<HTMLCanvasElement>) => {

  if(ev.buttons === 1 && ev.shiftKey === false)
  {
    orbit.prev_mouse[0] = ev.pageX;
    orbit.prev_mouse[1] = ev.pageY;

    orbit.curr_mouse[0] = ev.pageX;
    orbit.curr_mouse[1] = ev.pageY;
  }  
  else if(ev.buttons === 4)
  {
    orbit.prev_mouse[0] = ev.pageX;
    orbit.prev_mouse[1] = ev.pageY;

    orbit.curr_mouse[0] = ev.pageX;
    orbit.curr_mouse[1] = ev.pageY;
  }
}

const handleMouseMove = (ev: React.MouseEvent<HTMLCanvasElement>) => {

  if(ev.buttons === 1)
  {
    orbit.curr_mouse[0] = ev.pageX;
    orbit.curr_mouse[1] = ev.pageY;

    orbit.deltaPhi = orbit.curr_mouse[0] - orbit.prev_mouse[0];
    orbit.deltaTheta = orbit.curr_mouse[1] - orbit.prev_mouse[1];

    orbit.prev_mouse[0] = ev.pageX;
    orbit.prev_mouse[1] = ev.pageY;    
  } 
  if(ev.buttons === 4) 
  {
    orbit.curr_mouse[0] = ev.pageX;
    orbit.curr_mouse[1] = ev.pageY;

    orbit.deltaX = orbit.curr_mouse[0] - orbit.prev_mouse[0];
    orbit.deltaY = orbit.curr_mouse[1] - orbit.prev_mouse[1];

    console.log(orbit.deltaX);
    console.log(orbit.deltaY);

    orbit.prev_mouse[0] = ev.pageX;
    orbit.prev_mouse[1] = ev.pageY; 
  }
}

const handleMouseUp = (ev: React.MouseEvent<HTMLCanvasElement>) => {

  if(ev.buttons === 1 && ev.shiftKey === false)
  {
    orbit.deltaPhi = 0;
    orbit.deltaTheta = 0;
    orbit.deltaZoom = 0;
    orbit.deltaX = 0;
    orbit.deltaY = 0;
  }  
}
const handleMouseWheel = (ev: React.WheelEvent<HTMLCanvasElement>) => {
  orbit.deltaZoom = normalizeWheel(ev).spinY;//ev.deltaY;
}

const extensions = {'KTX': true, 'Draco': true, 'Quantization': true, 'KHR_materials_clearcoat': true, 'KHR_materials_sheen':true, 'KHR_materials_transmission':true};
const debugOptions = ['None', 'Occlusion', 'Shading Normal', "Base Color", "Metallic", "Roughness"];
const animations = ['Idle', 'Walk', 'Jump'];

let debugOutput2 = "None";

export default function LivePreviewSampleRenderer({src, imgSrc, statsCallback}: ImageComparisonSliderProps) {

  const [ktxLoaded, setKTXLoaded] = React.useState(false);
  const [dracoLoaded, setDracoLoaded] = React.useState(false);
  const [showOptions, setShowOptions] = React.useState(true);
  const [debugOutput, setDebugOutput] = React.useState("None");

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvas2DRef = React.useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  const canvasContainerWrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
      console.log("Effect", debugOutput)
      debugOutput2 = debugOutput;

    }, [debugOutput])

  React.useEffect(() => {
    if((ktxLoaded && dracoLoaded) == false)
      return;
    if(canvasRef == null || canvasRef.current == null) { return; }
    const canvas = canvasRef.current;
    const webGl2Context = canvas.getContext('webgl2') as WebGL2RenderingContext;
    webGl2Context.clearColor(1,0,0,1);
    webGl2Context.clear(webGl2Context.COLOR_BUFFER_BIT);

    const load = async () => {

      const {GltfView, GltfState} = await import('@khronosgroup/gltf-viewer/dist/gltf-viewer.module.js');
      const view = new GltfView(webGl2Context);
      const state = view.createState();
      state.sceneIndex = 0;
      state.animationIndices = [0, 1, 2];
      state.animationTimer.start();

      const resourceLoader = view.createResourceLoader();
      state.gltf = await resourceLoader.loadGltf("/DamagedHelmet.glb");
      
      const customGatherStatistics = async (state: InstanceType<typeof GltfState>) : Promise<Stats> => {

        const viewerStats = view.gatherStatistics(state);

        // gather information from the active scene
        const scene = state.gltf.scenes[state.sceneIndex];
        if (scene === undefined)
        {
            return {
              totalImagesFileSize: 0,
              numberOfVertices: 0,
              numberOfFaces: 0,
              totalFileSize: 0
            };
        }

        const loadBlob = async (src: string) => {
          return fetch(src)
          .then(response => response.blob())
          .then(blob => { return blob.size; })
          .catch(err => { return 0; });
        }

        const imagesFileSizes = [];
        for(let i = 0; i < state.gltf.images.length; i++)
          imagesFileSizes.push(loadBlob(state.gltf.images[i].image.src));
        const imagesFileSize = (await Promise.all(imagesFileSizes)).reduce((acc: number, curr: number) => acc + curr, 0);
        const totalFileSize = await loadBlob(src);

        // Face and Triangle count. Copied code from gltf-sample-renderer
        let numberOfVertices = 0;
        const nodes = scene.gatherNodes(state.gltf);
        const uniqueAccessors = new Set<number>();
        for(const node of nodes)
        {
          const activeMesh = node.mesh !== undefined && state.gltf.meshes[node.mesh];
          for(const primitive of activeMesh.primitives)
          {
            if(primitive !== undefined)
            {
              let vertexCount = 0;
              if (primitive.indices !== undefined) {
                  vertexCount = state.gltf.accessors[primitive.indices].count;
                  uniqueAccessors.add(primitive.indices);
              }
              else {
                  vertexCount = state.gltf.accessors[primitive.attributes["POSITION"]].count;
                  uniqueAccessors.add(primitive.attributes["POSITION"]);
              }
              if (vertexCount === 0) {
                  continue;
              }            
            }
          }
        }
        for(const accessor of uniqueAccessors)
        {
          numberOfVertices += state.gltf.accessors[accessor].count;
        }
        
        return {
          totalImagesFileSize: imagesFileSize,
          numberOfVertices: numberOfVertices,
          numberOfFaces: (viewerStats as {faceCount: number}).faceCount,
          totalFileSize: totalFileSize
        }
      };
      customGatherStatistics(state).then(res => { statsCallback(res); });
      
      resourceLoader.loadEnvironment("/footprint_court.hdr", {
         lut_ggx_file: "/assets/lut_ggx.png", 
         lut_charlie_file: "/assets/lut_charlie.png",
         lut_sheen_E_file: "/assets/lut_sheen_E.png"
      }).then((environment) => {
        state.environment = environment;
      })
      state.userCamera.perspective.aspectRatio = canvas.width / canvas.height;
      state.userCamera.fitViewToScene(state.gltf, state.sceneIndex);

      state.renderingParameters.debugOutput = GltfState.DebugOutput.generic.OCCLUSION;
      //state.renderingParameters.debugOutput = GltfState.DebugOutput.generic.NORMAL;
      state.renderingParameters.debugOutput = GltfState.DebugOutput.mr.BASECOLOR;
      state.renderingParameters.debugOutput = GltfState.DebugOutput.mr.ROUGHNESS;
      state.renderingParameters.debugOutput = GltfState.DebugOutput.mr.METALLIC;
      state.renderingParameters.debugOutput = debugOutput;
      const update = () =>
      { 
        console.log(debugOutput2);
        state.renderingParameters.debugOutput = debugOutput2;
        state.userCamera.orbit(orbit.deltaPhi, orbit.deltaTheta);
        if(orbit.deltaZoom)
          state.userCamera.zoomBy(orbit.deltaZoom);
        if(orbit.deltaX !== 0 || orbit.deltaY !== 0)
          state.userCamera.pan(orbit.deltaX, -orbit.deltaY);
        orbit.deltaPhi = 0;
        orbit.deltaTheta = 0;
        orbit.deltaZoom = 0;
        orbit.deltaX = 0;
        orbit.deltaY = 0;
        view.renderFrame(state, canvas.width, canvas.height);
        window.requestAnimationFrame(update);
      };
      window.requestAnimationFrame(update);
    };
    load();
  }, [src, ktxLoaded, dracoLoaded])

  React.useEffect(() => {
    if(canvasRef == null || canvasRef.current == null) { return; }
    if(canvas2DRef == null || canvas2DRef.current == null) { return; }
    if(canvasContainerRef == null || canvasContainerRef.current == null) { return; }
    if(canvasContainerWrapperRef == null || canvasContainerWrapperRef.current == null) { return; }
    
    const canvas = canvasRef.current;
    const canvas2D = canvas2DRef.current;
    const canvasContainer = canvasContainerRef.current;
    const canvasContainerWrapper = canvasContainerWrapperRef.current;

    const vhToPixels = (vh: number) => (vh * window.innerHeight) / 100;
    const vwToPixels = (vw: number) => (vw * window.innerWidth) / 100;

    const processImages = async () => {
      
      const [img1] = await Promise.all([loadImage(imgSrc)]) as HTMLImageElement[];

      const width = img1.width;
      const height = img1.height;
      //const ar = height / width;
      const ar = 9 / 16;
      
      const toolReisze = () => {
        if (canvasContainer.clientWidth == 0 || canvasContainer.clientHeight == 0) return;
          canvas.width = canvasContainer.clientWidth; // Update the actual width
          canvas.height = canvasContainer.clientHeight; // Update the actual height
          
          const maxWidth = 1920;  // Set max width
          const maxHeight = canvas.height; // Set max height
          
          // Calculate new dimensions while maintaining aspect ratio
          let width = canvasContainer.clientWidth;
          let height = canvasContainer.clientWidth * ar;
          if(width > maxWidth)
          {
            //width = maxWidth;
            //height = maxWidth * ar;
          }
          if(height > maxHeight)
          {
            height = maxHeight;
            width = maxHeight / ar;
          }

          canvasContainerWrapper.style.width = `${width}px`;
          canvasContainerWrapper.style.height = `${height}px`;
    
          canvas.width = width;
          canvas.height = height;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;

          canvas2D.width = width;
          canvas2D.height = height;
          canvas2D.style.width = `${width}px`;
          canvas2D.style.height = `${height}px`;

          const context2D = canvas2D.getContext('2d') as CanvasRenderingContext2D;
          context2D.drawImage(img1, 0, 0, width, height);
      };

      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          toolReisze();
        });
      });
        
      // Observe the canvas
      resizeObserver.observe(document.body);

      return resizeObserver;
    }

    const resizeObserverPromise = processImages();

    return () => {resizeObserverPromise.then(res => {res.disconnect()})}
  }, [imgSrc]);
  
    return (
      <Box ref={canvasContainerRef}>
        <Script src="https://www.gstatic.com/draco/v1/decoders/draco_decoder_gltf.js" strategy="lazyOnload" onLoad={() => { console.log("LOADEDDDDDDDD Draco"); setDracoLoaded(true);}} />
        <Script src="/libs/libktx.js" strategy="lazyOnload" onLoad={() => { console.log("LOADEDDDDDDDD KTX"); setKTXLoaded(true); }}/>
        <Box ref={canvasContainerWrapperRef} sx={{textAlign: "center", margin: "auto", position: 'relative', minHeight: '40vh'}}>
          <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onWheel={handleMouseWheel}/>
          <canvas ref={canvas2DRef} style={{display: 'none', backgroundColor: 'transparent', position: 'absolute', left: 0, top: 0, zIndex: 10}}/>

          {/* Button in bottom left */}
          <Box position="absolute" bottom={20} left={20} zIndex={10}>
            <IconButton color="default" onClick={() => setShowOptions(!showOptions)} sx={{ backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: 'gray', }, width: 32, height: 32, borderRadius: '50%', }}>
              <MenuIcon />
            </IconButton>
          </Box>
          {/* Floating options window */}
          {showOptions && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                bottom: 70,
                left: 10,
                zIndex: 9,
                p: 1,
                width: 200,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start', // ← This is key
              }}
              
            >
              <Typography variant="h6">Inspection</Typography>
              <Box display='flex' flexDirection='column' alignItems='flex-start' width='100%' overflow='hidden'>
                <Typography variant="subtitle2" gutterBottom>
                  Extensions
                </Typography>
                {Object.keys(extensions).map((extKey) => (
                  <FormControlLabel
                    key={extKey}
                    control={
                      <Switch
                        //checked={extensions[extKey]}
                        //onChange={() => toggleExtension(extKey)}
                      />
                    }
                    label={extKey}
                  />
                ))}
              </Box>

              <Box display='flex' flexDirection='column' alignItems='flex-start' mb={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Animation
                </Typography>
                
                  {animations.map((anim) => (
                    <Button
                      key={anim}
                      //onClick={() => setSelectedAnimation(anim)}
                      //variant={selectedAnimation === anim ? 'contained' : 'outlined'}
                    >
                      {anim}
                    </Button>
                  ))}
                
              </Box>
              <Box width='100%'>
                <FormControl fullWidth size="small">
                  <InputLabel id="debug-output-label">Debug Output</InputLabel>
                  <Select
                    labelId="debug-output-label"
                    value={debugOutput}
                    label="Debug Output"
                    onChange={(e) => { setDebugOutput(e.target.value)}}
                  >
                    {debugOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    );
};
