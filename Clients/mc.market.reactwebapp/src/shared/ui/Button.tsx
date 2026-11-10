import type { ComponentProps } from "react";
import { Link } from "react-router";
import { cx } from "../lib/cx";
import {
  buttonClasses,
  type ButtonSize,
  type ButtonVariant,
} from "./buttonClasses";

export function Button({
  variant,
  size,
  type = "button",
  className,
  ...rest
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      type={type}
      className={cx(buttonClasses({ variant, size }), className)}
      {...rest}
    />
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  ...rest
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <Link
      className={cx(buttonClasses({ variant, size }), className)}
      {...rest}
    />
  );
}
