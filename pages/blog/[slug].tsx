import { useRouter } from "next/router";
import { markdownToHtml, getPostBySlug, getAllPosts } from "../../utils/posts";
import Head from "next/head";
import { useLazyImages } from "../../utils/useLazyImages";
import { BlogLayout } from "../../components/BlogLayout";
import { Fragment } from "react";

type Params = {
  params: {
    slug: string;
  };
};

interface Props {
  post: {
    slug: string;
    title: string;
    content: string;
  };
}

export default function Post({ post }: Props) {
  const router = useRouter();

  useLazyImages();
  if (!router.isFallback && !post?.slug) {
    return null;
  }
  return router.isFallback ? (
    <div>Loading…</div>
  ) : (
    <Fragment>
      <Head>
        <title>{post.title} | Jonas Badalic</title>
      </Head>
      <main>
        <BlogLayout post={post} />
      </main>
    </Fragment>
  );
}

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug, [
    "title",
    "date",
    "slug",
    "author",
    "content",
    "ogImage",
    "coverImage",
  ]);
  const content = await markdownToHtml(post.content || "");

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(["slug"]);

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}
