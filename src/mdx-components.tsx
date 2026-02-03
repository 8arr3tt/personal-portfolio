import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Headings
    h1: ({ className, ...props }) => (
      <h1
        className={cn(
          "mt-8 mb-4 scroll-m-20 text-4xl font-bold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2
        className={cn(
          "mt-8 mb-4 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
          className
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={cn(
          "mt-6 mb-4 scroll-m-20 text-2xl font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    ),
    h4: ({ className, ...props }) => (
      <h4
        className={cn(
          "mt-6 mb-4 scroll-m-20 text-xl font-semibold tracking-tight",
          className
        )}
        {...props}
      />
    ),

    // Paragraph
    p: ({ className, ...props }) => (
      <p
        className={cn("leading-7 [&:not(:first-child)]:mt-4", className)}
        {...props}
      />
    ),

    // Lists
    ul: ({ className, ...props }) => (
      <ul className={cn("my-4 ml-6 list-disc", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol className={cn("my-4 ml-6 list-decimal", className)} {...props} />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("mt-2", className)} {...props} />
    ),

    // Blockquote
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          "mt-6 border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground",
          className
        )}
        {...props}
      />
    ),

    // Code blocks - styled by rehype-pretty-code
    pre: ({ className, ...props }) => (
      <pre
        className={cn(
          "my-4 overflow-x-auto rounded-lg border bg-muted p-4 text-sm",
          className
        )}
        {...props}
      />
    ),

    // Inline code
    code: ({ className, ...props }) => {
      // Check if this is inside a pre (code block) - rehype-pretty-code adds data attributes
      const isCodeBlock =
        typeof props.children === "string" &&
        (props as Record<string, unknown>)["data-language"];

      if (isCodeBlock) {
        return <code className={className} {...props} />;
      }

      return (
        <code
          className={cn(
            "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
            className
          )}
          {...props}
        />
      );
    },

    // Links
    a: ({ className, ...props }) => (
      <a
        className={cn(
          "font-medium text-primary underline underline-offset-4 hover:text-primary/80",
          className
        )}
        {...props}
      />
    ),

    // Horizontal rule
    hr: ({ ...props }) => <hr className="my-8 border-muted" {...props} />,

    // Table
    table: ({ className, ...props }) => (
      <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
        <table className={cn("w-full text-sm", className)} {...props} />
      </div>
    ),
    thead: ({ className, ...props }) => (
      <thead className={cn("bg-muted/50", className)} {...props} />
    ),
    tbody: ({ className, ...props }) => (
      <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
    ),
    tr: ({ className, ...props }) => (
      <tr
        className={cn("border-b border-border transition-colors hover:bg-muted/30", className)}
        {...props}
      />
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn(
          "h-11 px-4 text-left align-middle font-semibold text-foreground border-b border-border",
          className
        )}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td className={cn("px-4 py-3 align-middle", className)} {...props} />
    ),

    // Images
    img: ({ className, alt, ...props }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={cn("rounded-md border", className)}
        alt={alt}
        {...props}
      />
    ),

    // Custom components can be added here
    ...components,
  };
}
