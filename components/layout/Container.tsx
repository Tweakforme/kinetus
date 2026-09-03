import type { ElementType, HTMLAttributes, ReactNode } from "react";
import styles from "./Container.module.css";

type ContainerProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  /** Render as a different element (e.g. "nav", "section"). Defaults to "div". */
  as?: ElementType;
};

/**
 * Page container: 1240px max content width, 80px side margins on desktop and
 * 20px on mobile (Figma Grid/Desktop + Grid/Mobile). Values come from tokens.css.
 */
export function Container({ children, className, as: Component = "div", ...rest }: ContainerProps) {
  const classes = className ? `${styles.container} ${className}` : styles.container;
  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
