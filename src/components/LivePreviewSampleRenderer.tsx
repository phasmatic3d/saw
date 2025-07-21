"use client"
import React from 'react'
import Script from 'next/script'
import { Box, Button, IconButton, Paper, Checkbox, FormControlLabel, Switch, Typography, ButtonGroup, Select, FormControl, InputLabel, MenuItem  } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import normalizeWheel from 'normalize-wheel';

export type Stats = {
  totalImagesFileSize: number
  numberOfVertices: number
  numberOfFaces: number,
  totalFileSize: number
}

export type LivePreviewSampleRendererProps = {
  src: string,
  imgSrc: string,
  variants: Record<string, string>,
  statsCallback: (stats: Stats) => void,
  onReady: () => void
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
const handleMouseWheel = (ev: WheelEvent) => {
  orbit.deltaZoom = normalizeWheel(ev).spinY;//ev.deltaY;
  ev.preventDefault();
}

const available_extensions = { 
  KHR_materials_anisotropy: true, 
  KHR_materials_clearcoat: true, 
  KHR_materials_diffuse_transmission: true, 
  KHR_materials_dispersion: true, 
  KHR_materials_emissive_strength: true, 
  KHR_materials_ior: true, 
  KHR_materials_iridescence: true,
  KHR_materials_sheen: true,
  KHR_materials_specular: true, 
  KHR_materials_transmission: true, 
  KHR_materials_volume: true
};
const supported_extensions = new Map([ 
  ["KHR_materials_anisotropy", true], 
  ["KHR_materials_clearcoat", true],
  ["KHR_materials_diffuse_transmission", true],
  ["KHR_materials_dispersion", true],
  ["KHR_materials_emissive_strength", true],
  ["KHR_materials_ior", true],
  ["KHR_materials_iridescence", true],
  ["KHR_materials_sheen", true],
  ["KHR_materials_specular", true],
  ["KHR_materials_transmission", true],
  ["KHR_materials_volume", true]
]);
const debugOptions = ['None', "Base Color", "Metallic", "Roughness", 'Occlusion', 'Shading Normal'];

let active_debugOutput = "None";
let active_animations = [] as number[];
let active_extensions = new Map<string, boolean>(supported_extensions);
let active_variant = "glTF-Binary";
let change_variant = false;

export default function LivePreviewSampleRenderer({src, imgSrc, variants, statsCallback, onReady}: LivePreviewSampleRendererProps) {

  const [ktxLoaded, setKTXLoaded] = React.useState(false);
  const [dracoLoaded, setDracoLoaded] = React.useState(false);
  const [showOptions, setShowOptions] = React.useState(false);
  const [debugOutput, setDebugOutput] = React.useState("None");
  const [extensions, setExtensions] = React.useState(new Map<string, boolean>());
  const [animations, setAnimations] = React.useState<Array<string>>([]);
  const [modelVariants, setModelVariants] = React.useState('glTF-Binary');

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  const canvasContainerWrapperRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const toggleExtension = (extension: string, value: boolean) => {
    setExtensions(prev => {const ext = new Map(prev); ext.set(extension, value); return ext; })
    active_extensions.set(extension, value);
  }

  const toggleAnimation = (animation_name: string) =>
  {
    const index = animations.indexOf(animation_name)
    if(index >= 0)
      active_animations = [index];
    else
      console.warn("Error", animation_name);
  }

  React.useEffect(() => {
      active_debugOutput = debugOutput;
  }, [debugOutput])
  React.useEffect(() => {
      active_variant = modelVariants;
      change_variant = true;
  }, [modelVariants])

  React.useEffect(() => {
    if((ktxLoaded && dracoLoaded) == false)
      return;
    if(canvasRef == null || canvasRef.current == null) { return; }
    const canvas = canvasRef.current;
    const webGl2Context = canvas.getContext('webgl2') as WebGL2RenderingContext;
    //webGl2Context.clearColor(1,0,0,1);
    //webGl2Context.clear(webGl2Context.COLOR_BUFFER_BIT);

    const load = async () => {

      const {GltfView, GltfState} = await import('@khronosgroup/gltf-viewer/dist/gltf-viewer.module.js');
      const view = new GltfView(webGl2Context);
      const state = view.createState();
      state.sceneIndex = 0;
      state.animationIndices = [0, 1, 2];
      state.animationTimer.start();

      const resourceLoader = view.createResourceLoader();
      state.gltf = await resourceLoader.loadGltf(src);

      const animation_names = [] as string[];
      for(const animation of state.gltf.animations)
      {
        animation_names.push(animation.name?? "Animate");
      }
      setAnimations(animation_names);
      if(state.gltf.extensionsUsed)
      {
        const extension_names = new Map<string, boolean>();
        for(const extension of state.gltf.extensionsUsed)
        {
          if(supported_extensions.has(extension))
          {
            extension_names.set(extension as string, true);
          }
        }
        setExtensions(extension_names);
      }
      
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
          if(activeMesh)
          {
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
      
      resourceLoader.loadEnvironment("/Cannon_Exterior.hdr", {
         lut_ggx_file: "/assets/lut_ggx.png", 
         lut_charlie_file: "/assets/lut_charlie.png",
         lut_sheen_E_file: "/assets/lut_sheen_E.png"
      }).then((environment) => {
        state.environment = environment;
      })
      //state.renderingParameters.iblIntensity = Math.pow(10, 0.1/*intensity*/);
      state.sceneIndex = state.gltf.scene === undefined ? 0 : state.gltf.scene;
      const scene = state.gltf.scenes[state.sceneIndex];
      scene.applyTransformHierarchy(state.gltf);
      state.userCamera.perspective.aspectRatio = canvas.width / canvas.height;
      state.userCamera.resetView(state.gltf, state.sceneIndex);
      state.userCamera.fitViewToScene(state.gltf, state.sceneIndex);
      state.userCamera.orbitSpeed = Math.max(10.0 / canvas.width, 10.0 / canvas.height);

      state.renderingParameters.debugOutput = GltfState.DebugOutput.generic.OCCLUSION;
      //state.renderingParameters.debugOutput = GltfState.DebugOutput.generic.NORMAL;
      state.renderingParameters.debugOutput = GltfState.DebugOutput.mr.BASECOLOR;
      state.renderingParameters.debugOutput = GltfState.DebugOutput.mr.ROUGHNESS;
      state.renderingParameters.debugOutput = GltfState.DebugOutput.mr.METALLIC;
      state.renderingParameters.debugOutput = debugOutput;
      const update = () =>
      { 
        if(change_variant)
        {
          resourceLoader.loadGltf(variants[active_variant]).then(res => { console.log("Loaded"); state.gltf = res});          
          change_variant = false;
        }
        // Rendering Properties
        state.renderingParameters.debugOutput = active_debugOutput;
        state.animationIndices = active_animations;
        active_extensions.forEach((value, key) => {
          if (key in state.renderingParameters.enabledExtensions) {
            state.renderingParameters.enabledExtensions[key as keyof typeof state.renderingParameters.enabledExtensions] = value;
          }
        });

        // Camera Properties
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
    if(canvasContainerRef == null || canvasContainerRef.current == null) { return; }
    if(canvasContainerWrapperRef == null || canvasContainerWrapperRef.current == null) { return; }
    
    const canvas = canvasRef.current;
    const canvasContainer = canvasContainerRef.current;
    const canvasContainerWrapper = canvasContainerWrapperRef.current;

    const processImages = async () => {
      
      const toolResize = () => {
        if (canvasContainer.clientWidth == 0 || canvasContainer.clientHeight == 0) return;
          canvas.width = canvasContainer.clientWidth; // Update the actual width
          canvas.height = canvasContainer.clientHeight; // Update the actual height
          console.log("Resize", canvas.width, canvas.height)
          
          // Calculate new dimensions while maintaining aspect ratio
          let width = canvasContainer.clientWidth;
          let height = canvasContainer.clientHeight;

          canvasContainerWrapper.style.width = `${width}px`;
          canvasContainerWrapper.style.height = `${height}px`;
    
          canvas.width = width;
          canvas.height = height;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
      };

      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          toolResize();
        });
      });
        
      // Observe the canvas
      resizeObserver.observe(document.body);

      return resizeObserver;
    }

    const resizeObserverPromise = processImages();

    return () => {resizeObserverPromise.then(res => {res.disconnect()})}
  }, [imgSrc]);

  React.useEffect(() => {
    const isDracoLoaded = !!document.querySelector('script[src="https://www.gstatic.com/draco/v1/decoders/draco_decoder_gltf.js"]')
    const isKTXLoaded = !!document.querySelector('script[src="/libs/libktx.js"]')
    setKTXLoaded(isKTXLoaded);
    setDracoLoaded(isDracoLoaded);

    if(canvasRef.current)
      canvasRef.current.addEventListener('wheel', handleMouseWheel, { passive: false });

    return () => { 
      if(canvasRef.current)
        canvasRef.current.removeEventListener('wheel', handleMouseWheel);
    };
  }, [])
  
    return (
      <Box ref={canvasContainerRef}>
        <Script src="https://www.gstatic.com/draco/v1/decoders/draco_decoder_gltf.js" strategy="lazyOnload" onLoad={() => { console.log("LOADEDDDDDDDD Draco"); setDracoLoaded(true);}} />
        <Script src="/libs/libktx.js" strategy="lazyOnload" onLoad={() => { console.log("LOADEDDDDDDDD KTX"); setKTXLoaded(true); }}/>
        <Box ref={canvasContainerWrapperRef} sx={{textAlign: "center", margin: "auto", position: 'relative', minHeight: '40vh'}}>
          <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} style={{touchAction: 'none', overscrollBehavior: 'contain'}}/>
          <img ref={imgRef} src={imgSrc} style={{display: 'none', backgroundColor: 'transparent', position: 'absolute', left: 0, top: 0, zIndex: 10, objectFit: 'contain', width:"inherit", height:'inherit'}}/>

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
              <Box display={extensions.size>0? 'flex':'none'} flexDirection='column' alignItems='flex-start' width='100%' overflow='hidden'>
                <Typography variant="subtitle2" gutterBottom>
                  Extensions
                </Typography>
                { Array.from(extensions).map(([extName, extValue]) => (
                  <FormControlLabel
                    key={extName}
                    control={
                      <Switch
                        checked={extValue}
                        onChange={(ev, checked) => toggleExtension(extName, checked)}
                      />
                    }
                    label={extName.replace("KHR_materials_", "")}
                  />
                ))}
              </Box>

              <Box display={animations.length>0? 'flex':'none'} flexDirection='column' alignItems='flex-start' mb={1} mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Animation
                </Typography>
                
                  {animations.map((anim) => (
                    <Button
                      key={anim}
                      sx={{ justifyContent: 'flex-start', textAlign: 'left', textTransform: 'none' }}
                      color="inherit"
                      onClick={() => toggleAnimation(anim)}
                    >
                      {anim}
                    </Button>
                  ))}
                
              </Box>
              <Box width='100%' mt={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="debug-output-label">Debug Output</InputLabel>
                  <Select
                    labelId="debug-output-label"
                    value={debugOutput}
                    label="Debug Output"
                    onChange={(e) => { setDebugOutput(e.target.value)}}
                    MenuProps={{
                      disableScrollLock: true, // disables body padding-right
                    }}
                  >
                    {debugOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box width='100%' mt={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="variants-label">Variants</InputLabel>
                  <Select
                    labelId="variants-label"
                    value={modelVariants}
                    label="Variants"
                    onChange={(e) => { setModelVariants(e.target.value)}}
                    MenuProps={{
                      disableScrollLock: true, // disables body padding-right
                    }}
                  >
                    {Object.keys(variants).map((opt) => (
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
