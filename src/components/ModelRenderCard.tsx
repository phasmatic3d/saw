"use client"
import React from 'react'
import Image from 'next/image'
import { Box, Typography } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { basePath } from '@/lib/paths';

export type ModelCardProps = {
    name: string,
    thumbnail: string,
    onSelection: (arg0: string) => void
}

export default function ModelRenderCard({name, thumbnail, onSelection}: ModelCardProps) {

  return (
      <Box onClick={() => {}} width={'100%'} maxWidth={{xs: '100%', sm: '400px' }} 
            sx={{
                width: "100%",
                 margin: '5px',
                 "&:hover": {
                    backgroundColor: 'grey.700',
                    boxShadow: 3,
                    borderRadius: "16px"
                },
            }}>
          <Box position="relative">
            <Box width={"100%"} style={{width: "100%"}}>
                <Image
                width={512}
                height={512}
                quality={90}
                style={{ 
                    width: "100%",
                    height: "auto",
                    textAlign: "center", 
                    cursor: 'pointer', 
                    borderRadius: '16px',
                    transform: 'scale(1)', // Shrink image when selected
                    transition: 'transform 0.3s ease, border-radius 0.3s ease',
                }}
                src={`${basePath}${thumbnail}`}
                alt={name}  
                loading="lazy"
                />
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" p={1} justifyContent='center'>
            <Typography fontSize={18} fontWeight={'bold'} textAlign='center' sx={{overflowWrap: "anywhere"}}>{name}</Typography>
          </Box>          
      </Box>
  );
}