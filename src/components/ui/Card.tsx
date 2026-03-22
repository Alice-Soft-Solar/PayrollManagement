import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export const Card = ({ children, className, title }: CardProps) => {
  return (
    <section className={clsx("card", className)}>
      {title ? <h3 className="card-title">{title}</h3> : null}
      {children}
    </section>
  );
};
