import { Content } from "./Content";

export function BlogLayout(props: { post: any }) {
  return (
    <article>
      <Content>
        <h1>{props.post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: props.post.content }} />
      </Content>
    </article>
  );
}
