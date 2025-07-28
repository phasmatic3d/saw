"use client"
import React from 'react';
import { Chip, Typography, Box, Grid2 as Grid, Divider, Snackbar, Link } from "@mui/material";
import ModelRenderCard from "@/components/ModelRenderCard"
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
import License from '../License';

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
  tags: string[],
  modelURL: string,
  downloadUrl?: string,
  model: ModelType,
  showcaseModels: Array<ModelType>
  suggestedModels: Array<ModelType>
}

export default function ComparePage({name, label, image, tags, description, modelURL, downloadUrl, model, showcaseModels, suggestedModels}: ModelPageProps) {  
  const theme = useTheme();
  const [shareSnackbarOpen, setShareSnackbarOpen] = React.useState(false);
  const [isPreviewReady, setPreviewReady] = React.useState(false);

  const [meshStats, setMeshStats] = React.useState<Stats>({
    totalImagesFileSize: 0,
    numberOfVertices: 0,
    numberOfFaces: 0,
    totalFileSize: 0
  });

  const image1 = `${basePath}${image}`;

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

  return (
    <Box display="flex" sx={{width: '100%'}} flexDirection={{sm: 'row', xs:'column'}}>
      {/* Main Content */}
      <Box flex={4} p={{sm: 2, xs: 0}}>
        <LivePreviewSampleRenderer src={modelURL} imgSrc={image1} variants={model.variants} statsCallback={(stats => { setMeshStats(stats)})} onReady={() => setPreviewReady(true)}/>
        <Typography variant='h5' component="h1" sx={{paddingTop: 2}}>{label}</Typography>
        <Typography variant='body1' component='span' sx={{ml:1, fontWeight:'bold'}}>by: </Typography>{model.authors.join(", ")}
        {/* Tags */}
        <Box display='flex' flexDirection='row' flexWrap="wrap" mt={2}>
          {tags.map((e,i) => {
            return <Chip key={e} label={e} sx={{
              ml : {
                xs: 1,
                sm: i==0? 0 : 1,
              },
              mb: {
                xs: 1,
                sm: 0
              }, 
              bgcolor: theme.palette.grey[100], color: theme.palette.getContrastText(theme.palette.grey[100])
            }} />})
          }
          </Box>
        {/* Actions */}
        <Box display='flex' flexDirection={{xs:'column', sm:'row'}} width='100%' justifyContent='flex-start' mt={2}>
          {downloadUrl && <Box mr={3}>
            <Link href={downloadUrl} color="inherit" underline='hover' rel="noopener" sx={{fontWeight:'bold', display:'flex', alignItems:'center'}}>Download GLB<FileDownloadIcon fontSize='small' sx={{color: 'grey.100', ml: 0.5}}/></Link>
          </Box>}
          <Box mr={3}>
            <Link onClick={onShare} href="#" color="inherit" underline='hover' target="_blank" rel="noopener" sx={{fontWeight:'bold', display:'flex', alignItems:'center'}}>Share <ShareIcon fontSize='small' sx={{color: 'grey.100', ml: 0.5}}/></Link>
          </Box>
          {downloadUrl && <Box mr={3}>
            <ExternalLink url={`https://github.khronos.org/glTF-Sample-Viewer-Release/?model=${downloadUrl}`}>View on Sample Viewer</ExternalLink>
          </Box>}
          <Box mr={3}>
            <ExternalLink url={`https://github.khronos.org/glTF-Render-Fidelity/model/${name}`}>View on Render Fidelity</ExternalLink>
          </Box>
          <Box mr={1}>
            <Link href={`https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/${name}/README.md`} color="inherit" underline='hover' target="_blank" rel="noopener" sx={{fontWeight:'bold', display:'flex', alignItems:'center'}}>More info <LaunchIcon fontSize='small' sx={{ml:0.5}}/></Link>
          </Box>
        </Box>
        <Divider />
        {/* Quck Info */}
        <Box display='flex' flexDirection={{xs:'column', sm:'row'}} mt={2}>
          <Box mr={2}>
            <Typography component="span">{"Triangles:"}</Typography> <Typography component="span" sx={{fontWeight:'bold'}}>{toReadableNumber(meshStats.numberOfFaces)}</Typography>
          </Box>
          <Box mr={2}>
            <Typography component="span">{"Vertices:"}</Typography> <Typography component="span" sx={{fontWeight:'bold'}}>{toReadableNumber(meshStats.numberOfVertices)}</Typography>
          </Box>
          <Box mr={2}>
            <Typography component="span">{"File Size:"}</Typography> <Typography component="span" sx={{fontWeight:'bold'}}>{toReadableBytes(meshStats.totalFileSize)}</Typography>
          </Box>
          {meshStats.totalImagesFileSize > 0 && <Box mr={2}>
            <Typography component="span">{"Images Size:"}</Typography> <Typography component="span" sx={{fontWeight:'bold'}}>{toReadableBytes(meshStats.totalImagesFileSize)}</Typography>
          </Box>}
          
        </Box>
        {/* Description */}
        <Box display='flex' mt={2}>
          <Typography>{description}</Typography>          
        </Box>
        {/* License */}
        <Box display='flex' mt={2}>
          <Typography variant='body1' sx={{mr:1, fontWeight:'bold'}}>License: </Typography>{model.license.filter((item, index, arr) => index === arr.findIndex(o => o.license === item.license)).map(e => <License key={e.license} title={e.license} url={e.url} iconURL={e.icon} sx={{mr: 1}} />)}
        </Box>


      </Box>
      {/* Right Content - Suggested */}
      <Box sx={{flex: 1}} mt={{sm: 0, xs: 2}}>
        <Grid className={styles.side} sx={{overflow: "auto", width:'100%'}} height={"80vh"} container spacing={2}>
          <Box display="flex" mt={1} sx={{width: '100%'}}><Typography variant='h6' component='h2'>{"Top picks"}</Typography></Box>
          {showcaseModels.map((e,i) => { return <ModelRenderCard key={e.name+""+i} name={e.name} label={e.label} thumbnail={e.thumbnail} />})}
          <Box display="flex" mt={1} sx={{width: '100%'}}><Typography variant='h6' component='h2'>{"See Also"}</Typography></Box>
          {suggestedModels.map((e,i) => { return <ModelRenderCard key={e.name+""+i} name={e.name} label={e.label} thumbnail={e.thumbnail} />})}
        </Grid>
      </Box>
    </Box>);
}