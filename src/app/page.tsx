import type { Metadata } from 'next'
import styles from "./page.module.css";
import LandingPage from "@/components/Pages/LandingPage";
import ModelList from "@/data/model-index.SampleAssets.json"

export const metadata: Metadata = {
  title: 'Khronos Sample Assets',
  description: 'Khronos Sample Assets Website',
}

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <LandingPage models={Object.values(ModelList)}/>                        
      </main>
    </div>
  );
}
