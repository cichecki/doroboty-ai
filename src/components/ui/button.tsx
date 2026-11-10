import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/*
 * Noir button recipe (see .nb in src/app/noir-host.css). The skewed shape is painted by a
 * pseudo-element, so the same classes work on <button>, <a> and <label> without inner markup,
 * and the dashed focus outline is never clipped.
 * The master variant renders the design system NButton markup instead (stripe wave + glints).
 * Use <Button variant="master"> for buttons; for links put <MasterBody> inside a link with
 * masterClassName(size), so the link keeps its link semantics.
 */
const buttonVariants = cva("nb", {
  variants: {
    variant: {
      master: "nb--master",
      default: "nb--primary",
      outline: "nb--secondary",
      secondary: "nb--quiet",
      ghost: "nb--ghost",
      destructive: "nb--danger",
      link: "nb--link",
    },
    size: {
      default: "nb--md",
      xs: "nb--xs",
      sm: "nb--sm",
      lg: "nb--lg",
      icon: "nb--icon",
      "icon-xs": "nb--icon nb--icon-xs",
      "icon-sm": "nb--icon nb--icon-sm",
      "icon-lg": "nb--icon nb--icon-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

function Glint({ small }: { small?: boolean }) {
  return (
    <svg
      className={`nbtn__glint${small ? " nbtn__glint--small" : ""}`}
      viewBox="0 0 30 30"
      aria-hidden="true"
    >
      <path d="M15 1 L18 12 L29 15 L18 18 L15 29 L12 18 L1 15 L12 12 Z" />
    </svg>
  );
}

/** Inner markup of the design system master button: stripe wave, label and two glints. */
function MasterBody({ children, glints = true }: { children: React.ReactNode; glints?: boolean }) {
  return (
    <>
      <span className="nbtn__body">
        <span className="nbtn__wave" aria-hidden="true" />
        <span className="nbtn__label">{children}</span>
      </span>
      {glints && (
        <>
          <Glint />
          <Glint small />
        </>
      )}
    </>
  );
}

function masterClassName(size: VariantProps<typeof buttonVariants>["size"] = "default") {
  return cn(
    "nbtn nbtn--master",
    (size === "sm" || size === "xs") && "nbtn--sm",
    size === "lg" && "nbtn--lg",
  );
}

function Button({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  if (variant === "master")
    return (
      <ButtonPrimitive
        data-slot="button"
        data-stripes={3}
        className={cn(masterClassName(size), className)}
        {...props}
      >
        <MasterBody glints={!props.disabled}>{children as React.ReactNode}</MasterBody>
      </ButtonPrimitive>
    );
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
}

export { Button, buttonVariants, MasterBody, masterClassName };
