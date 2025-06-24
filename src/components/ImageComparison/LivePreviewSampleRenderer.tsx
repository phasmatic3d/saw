"use client"
import React from 'react'
import { Box } from "@mui/material";
//import * as Renderer from "@khronosgroup/gltf-viewer"

// Load the images
const loadImage = (src: string) =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = '';
    img.onload = () => resolve(img);
  }
);

export type ImageComparisonSliderProps = {
  src: string,
  imgSrc: string
}

export default function LivePreviewSampleRenderer({src, imgSrc}: ImageComparisonSliderProps) {

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);
  const canvasContainerWrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if(canvasRef == null || canvasRef.current == null) { return; }
    const canvas = canvasRef.current;
    /*const webGl2Context = canvas.getContext('webgl2') as WebGL2RenderingContext;
    const view = new Renderer.GltfView(webGl2Context);
    const state = view.createState();
    state.sceneIndex = 0;
    state.animationIndices = [0, 1, 2];
    state.animationTimer.start();
    const resourceLoader = view.createResourceLoader(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.7/",
      "libktx.js"
    );
    //state.gltf = await Renderer.resourceLoader.loadGltf("path/to/some.gltf");
    resourceLoader.loadGltf(src).then((res: any) => {state.gltf = res;});
    const update = () =>
    {
        view.renderFrame(state, canvas.width, canvas.height);
        window.requestAnimationFrame(update);
    };
    window.requestAnimationFrame(update);*/
  }, [src])

  React.useEffect(() => {
    if(canvasRef == null || canvasRef.current == null) { return; }
    if(canvasContainerRef == null || canvasContainerRef.current == null) { return; }
    if(canvasContainerWrapperRef == null || canvasContainerWrapperRef.current == null) { return; }
    
    const canvas = canvasRef.current;
    const canvasContainer = canvasContainerRef.current;
    const canvasContainerWrapper = canvasContainerWrapperRef.current;

    const vhToPixels = (vh: number) => (vh * window.innerHeight) / 100;
    const vwToPixels = (vw: number) => (vw * window.innerWidth) / 100;

    const processImages = async () => {
      
      const [img1] = await Promise.all([loadImage(imgSrc)]) as HTMLImageElement[];

      const width = img1.width;
      const height = img1.height;
      const ar = height / width;
      
      const toolReisze = () => {
        if (canvasContainer.clientWidth == 0 || canvasContainer.clientHeight == 0) return;
          canvas.width = canvasContainer.clientWidth; // Update the actual width
          canvas.height = canvasContainer.clientHeight; // Update the actual height
          
          const maxWidth = 1920;  // Set max width
          const maxHeight = canvas.height; // Set max height
          
          // Calculate new dimensions while maintaining aspect ratio
          const width = canvasContainer.clientWidth;
          const height = canvasContainer.clientWidth * ar;
          if(width > maxWidth)
          {
            //width = maxWidth;
            //height = maxWidth * ar;
          }
          if(height > maxHeight)
          {
            //height = maxHeight;
            //width = maxHeight * aspectRatio;
          }

          canvasContainerWrapper.style.width = `${width}px`;
          canvasContainerWrapper.style.height = `${height}px`;
    
          canvas.width = width;
          canvas.height = height;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
      };

      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          toolReisze();
        });
      });
        
      // Observe the canvas
      //resizeObserver.observe(canvasContainer);
      resizeObserver.observe(document.body);

      return resizeObserver;
    }

    const resizeObserverPromise = processImages();

    return () => {resizeObserverPromise.then(res => {res.disconnect()})}
  }, [imgSrc]);
  
    return (
      <Box ref={canvasContainerRef}>
        <Box ref={canvasContainerWrapperRef} sx={{textAlign: "center", margin: "auto"}}>
          <canvas ref={canvasRef}/>
        </Box>
      </Box>
    );
};
