import Head from "next/head";
import { Fragment } from "react";
import { Content } from "../components/Content";
import styles from "../styles/Home.module.css";
import { getAllPosts } from "../utils/posts";

export function getStaticProps() {
  return {
    props: {
      posts: getAllPosts(["date", "title"]),
    },
  };
}

export default function Home({ posts }: { posts: any }) {
  return (
    <Fragment>
      <Head>
        <title>Jonas Badalic</title>
        <meta property="og:site_name" content="Jonas Badalic" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Jonas Badalic" />
        <meta property="og:description" content="Engineer @Sentry" />
        <meta property="og:url" content="" />
        <meta property="og:image" content="/images/cover1.jpg" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Jonas Badalic" />
        <meta name="twitter:description" content="Engineer @Sentry" />
        <meta name="twitter:url" content="" />
        <meta name="twitter:image:src" content="/images/cover1.jpg" />
      </Head>

      <main>
        <header className={styles.Header}>
          <h1 className={styles.HeaderTitle}>Jonas Badalic</h1>
          <p className={styles.HeaderSubtitle}>
            Thoughts and notes on things I find amusing or important.
          </p>
        </header>
        <section>
          <Content>
            {posts.map((p:any,i: any) => {
              return (
                <a key={i} className={styles.Summary} href={`/blog/${p.slug}`}>
                  {/* <span>{new Date(p.date).toLocaleDateString()}</span> */}
                  <h3 className={styles.SummaryTitle}>{p.title}</h3>
                </a>
              );
            })}
          </Content>
        </section>
      </main>
    </Fragment>
  );
}
