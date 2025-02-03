import type { ImageResponseOptions } from "next/dist/compiled/@vercel/og/types";
import { ImageResponse } from "next/og";
import type { ReactElement, ReactNode } from "react";

interface GenerateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  primaryColor?: string;
  primaryTextColor?: string;
  site?: ReactNode;
}

export function generateOGImage(
  options: GenerateProps & ImageResponseOptions,
): ImageResponse {
  const {
    title,
    description,
    icon,
    site,
    primaryColor,
    primaryTextColor,
    ...rest
  } = options;

  return new ImageResponse(
    generate({
      title,
      description,
      icon,
      site,
      primaryTextColor,
      primaryColor,
    }),
    {
      width: 1200,
      height: 630,
      ...rest,
    },
  );
}

export function generate({ ...props }: GenerateProps): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        color: "white",
        backgroundColor: "#000000",
        backgroundImage: `
          radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.15), transparent 60%),
          radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.08), transparent 50%)
        `,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "3.5rem",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {props.icon}
          <span
            style={{
              fontSize: "64px",
              fontWeight: 700,
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {props.site}
          </span>
        </div>

        <h1
          style={{
            fontSize: "72px",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em",
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {props.title}
        </h1>

        <p
          style={{
            fontSize: "36px",
            color: "rgba(255, 255, 255, 0.8)",
            lineHeight: 1.4,
            maxWidth: "90%",
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {props.description}
        </p>
      </div>
    </div>
  );
}
