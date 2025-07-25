"use client"
import React from 'react'
import Image from 'next/image'
import NextLink from 'next/link';
import { Box, Typography, Link } from "@mui/material";
import { basePath } from '@/lib/paths';

export type ModelCardProps = {
    name: string,
    label: string,
    thumbnail: string
}

export default function ModelRenderCard({name, label, thumbnail}: ModelCardProps) {

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
              <Link component={NextLink} href={encodeURI(`/model/${name}`)}>
                <Image
                width={512}
                height={512}
                quality={90}
                unoptimized
                style={{ 
                    width: "100%",
                    height: "auto",
                    objectFit: 'cover',
                    textAlign: "center", 
                    cursor: 'pointer', 
                    borderRadius: '16px',
                    transform: 'scale(1)', // Shrink image when selected
                    transition: 'transform 0.3s ease, border-radius 0.3s ease',
                }}
                src={`${basePath}${thumbnail}`}
                alt={label}  
                loading="lazy"
                />
              </Link>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" p={0} justifyContent='center'>
            <Typography fontSize={18} fontWeight={'bold'} textAlign='center' sx={{overflowWrap: "anywhere"}}>{label}</Typography>
          </Box>          
      </Box>
  );
}