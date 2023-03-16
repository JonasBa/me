import styles from "./Content.module.css";

export function Content(props: any) {
  return <div className={styles.Content}>{props.children}</div>;
}
