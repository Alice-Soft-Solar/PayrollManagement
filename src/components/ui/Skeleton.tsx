import clsx from "clsx";

interface SkeletonProps {
  height?: number;
  width?: string;
  className?: string;
}

export const Skeleton = ({
  height = 16,
  width = "100%",
  className,
}: SkeletonProps) => {
  return (
    <div
      className={clsx("skeleton", className)}
      style={{ height: `${height}px`, width }}
    />
  );
};
