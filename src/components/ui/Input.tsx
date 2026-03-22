import { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <label className="input-group">
      <span className="input-label">{label}</span>
      <input className={clsx("input", className)} {...props} />
      {error ? <span className="input-error">{error}</span> : null}
    </label>
  );
};
