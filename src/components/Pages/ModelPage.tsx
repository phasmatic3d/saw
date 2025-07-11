"use client"
import React from 'react';
import { Chip, Typography, Box, Grid2 as Grid, Divider, Button, Popper, Grow, Paper, IconButton, Snackbar, Link } from "@mui/material";
import ModelRenderCard from "@/components/ModelRenderCard"
import ImageDifferenceView from '@/components/ImageComparison/ImageDifferenceView';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import styles from "./ModelPage.module.css";
import LaunchIcon from '@mui/icons-material/Launch';
import ShareIcon from '@mui/icons-material/Share';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LivePreviewSampleRenderer from '@/components/LivePreviewSampleRenderer'
import { basePath } from '@/lib/paths';
import { ModelType } from '@/lib/types';
import { Stats } from "@/components/LivePreviewSampleRenderer";
import { toReadableBytes, toReadableNumber } from '@/lib/conversions';

type ExternalLinkProps = {
  url: string,
}
function ExternalLink( {url, children} : React.PropsWithChildren<ExternalLinkProps>) {
  return (<Link href={url} color="inherit" underline='hover' target="_blank" rel="noopener" sx={{fontWeight:'bold', display:'flex', alignItems:'center'}}>{children} <LaunchIcon fontSize='small' sx={{ml:0.5}}/></Link>)
}

type ModelPageProps = {
  name: string,
  label: string,
  description: string,
  image: string,
  downloadUrl?: string,
  showcaseModels: Array<ModelType>
  suggestedModels: Array<ModelType>
}

export default function ComparePage({name, label, image, description, downloadUrl, showcaseModels, suggestedModels}: ModelPageProps) {  
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const [isVisible, setIsVisible] = React.useState(!isXs); 
  const [isMagnified, setMagnified] = React.useState(false);
  const [comparisonMode, setComparisonMode] = React.useState(0);
  const [shareSnackbarOpen, setShareSnackbarOpen] = React.useState(false);
  const zoomOffsetRef = React.useRef<HTMLDivElement>(null);

  const [meshStats, setMeshStats] = React.useState<Stats>({
    totalImagesFileSize: 0,
    numberOfVertices: 0,
    numberOfFaces: 0,
    totalFileSize: 0
  });

  const toggleDiv = () => {
    setIsVisible(!isVisible);
  };

  const toggleMagnified = (open: boolean) => {
    
    const off = zoomOffsetRef && zoomOffsetRef.current;
    if(off && open)
      setTimeout(() => {window.scrollTo({top: off.offsetTop, behavior: 'smooth'});}, 20)
    setMagnified(open);
  }

  const image1 = `${basePath}${image}`;
  const image2 = `${basePath}${image}`;

  const onShare = () => {
    const shareURL = `${basePath}/compare/${name}`;
    if (navigator.share) {
      navigator.share({
        title: `Khronos Render Fidelity`,
        url: shareURL
      }).then(() => {
        console.log('Thanks for sharing!');
      })
      .catch(console.error);
    } else {
      // fallback
      navigator.clipboard.writeText(shareURL);
      setShareSnackbarOpen(true);
    }
  }

  const descriptionComponent = <Box>
    <Box display='flex' justifyContent='space-between'>
      <Typography variant='h6'>Description</Typography>
      <Box>
        <Snackbar
          open={shareSnackbarOpen}
          onClose={() => {setShareSnackbarOpen(false)}}
          message="Model Copied"
          key={"Share"}
          autoHideDuration={1200}
        />
        {downloadUrl && <IconButton component="a" href={downloadUrl} download><FileDownloadIcon sx={{color: 'grey.100'}}/></IconButton>}
      </Box>
    </Box>
    <Typography textAlign='left'>{description}</Typography>
    <Box mt={2}>
      <ExternalLink url={`https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/${name}/README.md`} />
    </Box>
    <Box display='flex' alignItems='center' mt={1}>
      <Link onClick={onShare} href="#" color="inherit" underline='hover' target="_blank" rel="noopener" sx={{fontWeight:'bold', display:'flex', alignItems:'center'}}>Share <ShareIcon fontSize='small' sx={{color: 'grey.100', ml: 0.5}}/></Link>
    </Box>
  </Box>;

  const tags = ["Showcase", "KTX", "Furniture", "Draco", "Sheen"];

  return (
    <Box display="flex" sx={{width: '100%'}}>
      {/* Main Content */}
      <Box flex={4} p={2}>
        {comparisonMode===0 && <LivePreviewSampleRenderer src={"https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb"} imgSrc={image1} statsCallback={(stats => { setMeshStats(stats)}) }/>}
        {comparisonMode===1 && <ImageDifferenceView key={isMagnified.toString()} imgSrc1={image1} imgSrc2={image2}/>}
        <Typography variant='h5' component="h1" sx={{paddingTop: 2, paddingBottom: 2}}>{label}</Typography>
        {/* Tags */}
        <Box display='flex' flexDirection='row'>
          {tags.map((e,i) => {return <Chip key={e} label={e} sx={{ml : i==0? 0 : 1, fontWeight: 'bold'}} color={"success"} />})}
        </Box>
        {/* Actions */}
        <Box display='flex' flexDirection='row' width='100%' justifyContent='flex-start' mt={2}>
          {false && downloadUrl && <IconButton component="a" href={downloadUrl} download><FileDownloadIcon sx={{color: 'grey.100'}}/></IconButton>}
          <Box mr={3}>
            <Link href={downloadUrl} color="inherit" underline='hover' rel="noopener" sx={{fontWeight:'bold', display:'flex', alignItems:'center'}}>Download GLB<FileDownloadIcon fontSize='small' sx={{color: 'grey.100', ml: 0.5}}/></Link>
          </Box>
          <Box mr={3}>
            <Link onClick={onShare} href="#" color="inherit" underline='hover' target="_blank" rel="noopener" sx={{fontWeight:'bold', display:'flex', alignItems:'center'}}>Share <ShareIcon fontSize='small' sx={{color: 'grey.100', ml: 0.5}}/></Link>
          </Box>
          <Box mr={3}>
            <ExternalLink url={`https://github.khronos.org/glTF-Sample-Viewer-Release/?model=${downloadUrl}`}>See on sample viewer</ExternalLink>
          </Box>
          <Box mr={3}>
            <ExternalLink url={`https://github.khronos.org/glTF-Compressor-Release/?model=${downloadUrl}`}>Compare</ExternalLink>
          </Box>
          <Box mr={1}>
            <Link href={`https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/${name}/README.md`} color="inherit" underline='hover' target="_blank" rel="noopener" sx={{fontWeight:'bold', display:'flex', alignItems:'center'}}>More info <LaunchIcon fontSize='small' sx={{ml:0.5}}/></Link>
          </Box>
        </Box>
        <Divider />
        {/* Quck Info */}
        <Box display='flex' flexDirection='row' mt={2}>
          <Box mr={1}>
            <Typography component="span">{"Trianges:"}</Typography> <Typography component="span" sx={{fontWeight:'bold'}}>{toReadableNumber(meshStats.numberOfFaces)}</Typography>
          </Box>
          <Box mr={1}>
            <Typography component="span">{"Vertices:"}</Typography> <Typography component="span" sx={{fontWeight:'bold'}}>{toReadableNumber(meshStats.numberOfVertices)}</Typography>
          </Box>
          <Box mr={1}>
            <Typography component="span">{"FileSize:"}</Typography> <Typography component="span" sx={{fontWeight:'bold'}}>{toReadableBytes(meshStats.totalFileSize)}</Typography>
          </Box>
          <Box mr={1}>
            <Typography component="span">{"ImagesSize:"}</Typography> <Typography component="span" sx={{fontWeight:'bold'}}>{toReadableBytes(meshStats.totalImagesFileSize)}</Typography>
          </Box>
          
        </Box>
        {/* Description */}
        <Box display='flex' mt={2}>
          <Typography>{description}</Typography>          
        </Box>


      </Box>
      {/* Right Content - Suggested */}
      <Box sx={{flex: 1}}>
        {!isMagnified && <Grid className={styles.side} display={{xs:'none', sm:'flex'}} sx={{overflow: "auto", width:'100%'}} height={"70vh"} container spacing={2}>
          <Box display="flex" mt={1} sx={{width: '100%'}}><Typography variant='h6'>{"Showcase"}</Typography></Box>
          {showcaseModels.map((e,i) => { return <ModelRenderCard key={e.name+""+i} name={e.name} thumbnail={e.thumbnail} onSelection={ () => {}}/>})}
          <Box display="flex" mt={1} sx={{width: '100%'}}><Typography variant='h6'>{"Suggested"}</Typography></Box>
          {suggestedModels.map((e,i) => { return <ModelRenderCard key={e.name+""+i} name={e.name} thumbnail={e.thumbnail} onSelection={ () => {}}/>})}
        </Grid>}
      </Box>
    </Box>);
}