"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          "--normal-bg": "#1e1e1e",
          "--normal-text": "#ffffff",
          "--normal-border": "#444444",
          "--success-bg": "#14532d",
          "--success-text": "#ffffff",
          "--error-bg": "#7f1d1d",
          "--error-text": "#ffffff",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
