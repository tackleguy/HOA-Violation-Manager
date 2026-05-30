import { notFound } from "next/navigation";
import { HelpLayout } from "@/components/help/help-layout";
import { HelpSidebar } from "@/components/help/help-sidebar";
import { HelpArticleView } from "@/components/help/help-article";
import { getHelpArticle, HELP_ARTICLES } from "@/lib/help/articles";

export function generateStaticParams() {
  return HELP_ARTICLES.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const article = getHelpArticle(slug);
    if (!article) return { title: "Help | HOAFlow" };
    return {
      title: `${article.title} | HOAFlow Help`,
      description: article.description
    };
  });
}

export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getHelpArticle(slug);
  if (!article) notFound();

  return (
    <HelpLayout>
      <HelpSidebar />
      <HelpArticleView article={article} />
    </HelpLayout>
  );
}
