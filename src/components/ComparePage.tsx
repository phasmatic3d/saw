"use client"
import React from 'react';
import { Typography, Box, Grid2 as Grid, ButtonGroup, Button, Popper, Grow, Paper, ClickAwayListener, MenuItem , MenuList, IconButton, Snackbar, Link } from "@mui/material";
import ModelRenderCard from "@/components/ModelRenderCard"
import ImageComparisonSlider from "@/components/ImageComparison/ImageComparisonSlider";
import ImageDifferenceView from './ImageComparison/ImageDifferenceView';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import styles from "./ComparePage.module.css";
import InfoIcon from '@mui/icons-material/Info';
import LaunchIcon from '@mui/icons-material/Launch';
import SwitchLeftIcon from '@mui/icons-material/SwitchLeft';
import SwitchRightIcon from '@mui/icons-material/SwitchRight';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import EngineSelection from './EngineSelection';
import ShareIcon from '@mui/icons-material/Share';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ComparisonButton from '@/components/ComparisonButton';
import LivePreviewSampleRenderer from '@/components/LivePreviewSampleRenderer'
import { basePath } from '@/lib/paths';
import { ModelType } from '@/lib/types';

type ComparePageProps = {
  name: string,
  label: string,
  description: string,
  image: string,
  downloadUrl?: string,
  showcaseModels: Array<ModelType>
  suggestedModels: Array<ModelType>
}

export default function ComparePage({name, label, image, description, downloadUrl, showcaseModels, suggestedModels}: ComparePageProps) {  
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const [isVisible, setIsVisible] = React.useState(!isXs); 
  const [isMagnified, setMagnified] = React.useState(false);
  const [comparisonMode, setComparisonMode] = React.useState(0);
  const [shareSnackbarOpen, setShareSnackbarOpen] = React.useState(false);
  const zoomOffsetRef = React.useRef<HTMLDivElement>(null);

  const toggleDiv = () => {
    setIsVisible(!isVisible);
  };

  const toggleMagnified = (open: boolean) => {
    
    const off = zoomOffsetRef && zoomOffsetRef.current;
    if(off && open)
      setTimeout(() => {window.scrollTo({top: off.offsetTop, behavior: 'smooth'});}, 20)
    setMagnified(open);
  }

  let image1 = `${basePath}${image}`;
  let image2 = `${basePath}${image}`;

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
        {false && <IconButton onClick={onShare}><ShareIcon sx={{color: 'grey.100'}}/></IconButton>}
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
      <Link href={`https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/${name}/README.md`} color="inherit" underline='hover' target="_blank" rel="noopener" sx={{fontWeight:'bold', display:'flex', alignItems:'center'}}>More info <LaunchIcon fontSize='small' sx={{ml:0.5}}/></Link>
    </Box>
    <Box display='flex' alignItems='center' mt={1}>
      <Link onClick={onShare} href="#" color="inherit" underline='hover' target="_blank" rel="noopener" sx={{fontWeight:'bold', display:'flex', alignItems:'center'}}>Share <ShareIcon fontSize='small' sx={{color: 'grey.100', ml: 0.5}}/></Link>
    </Box>
  </Box>;

  return (
    <>
      <Grid container direction={{xs:"column-reverse", sm:'row'}} className={styles.main} sx={{flexWrap: "nowrap"}} spacing={2}>
        {!isMagnified && <Grid className={styles.description} height={"70vh"} sx={{overflow: "auto"}}>
          <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center" }}> 
            <Typography variant='h6' component="h1">{label}</Typography>
            <Box onClick={toggleDiv} display={{ xs: 'inline-block', sm: 'none' }}>
              <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" }}>
                {isXs && <InfoIcon />}
              </Box>
            </Box>
          </Box>
          {(!isXs) && descriptionComponent}
          {(isXs && isVisible) && descriptionComponent}
        </Grid>}
        {/* Main */}
        <Box ref={zoomOffsetRef} className={styles.tool} width={{xs:'100%', sm: isMagnified? '100%' : '60%'}}>
          <Box pb={1} sx={{display:'flex', width: "100%", justifyContent: {xs: 'space-between', sm:'space-between'}}}>
            {!isXs && isMagnified && <CloseFullscreenIcon onClick={() => toggleMagnified(false)} sx={{cursor: "pointer"}} /> }
            {!isXs && !isMagnified && <OpenInFullIcon onClick={() => toggleMagnified(true)} sx={{cursor: "pointer"}} /> }
            {isXs && <Box width={"24px"}/>}
    
            <ComparisonButton handleSelection={(index:number) => {setComparisonMode(index)}}/>
          </Box>
          {comparisonMode===0 && <LivePreviewSampleRenderer src={"https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb"} imgSrc={image1}/>}
          {comparisonMode===2 && <ImageDifferenceView key={isMagnified.toString()} imgSrc1={image1} imgSrc2={image2}/>}
        </Box>

        {!isMagnified && <Grid className={styles.side} display={{xs:'none', sm:'flex'}} sx={{overflow: "auto"}} height={"70vh"} container spacing={2}>
          <Box display="flex" mt={1} sx={{width: '100%'}}><Typography>{"Showcase"}</Typography></Box>
          {showcaseModels.map((e,i) => { return <ModelRenderCard key={e.name} name={e.name} thumbnail={e.thumbnail} onSelection={ () => {}}/>})}
          <Box display="flex" sx={{width: '100%'}}><Typography>{"Suggested"}</Typography></Box>
          {suggestedModels.map((e,i) => { return <ModelRenderCard key={e.name} name={e.name} thumbnail={e.thumbnail} onSelection={ () => {}}/>})}
        </Grid>}
      </Grid>
    </>
  )
}
