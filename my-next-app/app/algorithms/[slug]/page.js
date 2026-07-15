import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import AlgorithmView from "@/components/AlgorithmView";
import { algorithms, getAlgorithm } from "@/lib/algorithms";

export function generateStaticParams() {
  return algorithms.map((a) => ({ slug: a.meta.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const algo = getAlgorithm(slug);
  if (!algo) return { title: "Not found — RateLab" };
  return {
    title: `${algo.meta.name} — RateLab`,
    description: algo.meta.summary,
  };
}

export default async function AlgorithmPage({ params }) {
  const { slug } = await params;
  if (!getAlgorithm(slug)) notFound();

  return (
    <>
      <SiteHeader />
      <AlgorithmView slug={slug} />
    </>
  );
}
