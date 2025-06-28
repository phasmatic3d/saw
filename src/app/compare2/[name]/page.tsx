import React from 'react'
import type { Metadata, ResolvingMetadata  } from 'next'
import ComparePage from "@/components/Pages/ComparePage";
import models from "@/data/model-index.SampleAssets.json"
import { baseUrl } from '@/lib/paths';
import { ModelType } from '@/lib/types';

export const dynamicParams = false; // models that are not included in the list, generate 404

export async function generateStaticParams() {
    
    return Object.values(models).map((model) => ({
      name: model.name
    }))
}

type Props = {
  params: Promise<{ name: string}>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata( { params, searchParams }: Props, parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const {name} = await params;
 
  // fetch data
  const model = (models as Record<string, ModelType>)[name];
 
  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || []
 
  return {
    metadataBase: new URL(baseUrl),
    title: model.label,
    description: model.description,
    openGraph: {
      title: model.label,
      description: model.description,
      images: [model.thumbnail, ...previousImages],
    },
    robots: {
      index: false,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: false,
        noimageindex: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  }
}

export default async function Page({params}: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  const model = (models as Record<string, ModelType>)[name];

  const showcaseModels : Array<ModelType> = [
    model,
    model,
    model
  ];
  const suggestedModels : Array<ModelType> = [
    model,
    model,
    model,
    model
  ];
  
  return <ComparePage name={name} label={model.label} description={model.description} image={model.image} downloadUrl={model.downloadModel} showcaseModels={showcaseModels} suggestedModels={suggestedModels}/>
}