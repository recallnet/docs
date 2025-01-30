import { generateOGImage } from "fumadocs-ui/og";
import { metadataImage } from "../../../lib/metadata";

export const GET = metadataImage.createAPI(async (page) => {
  return generateOGImage({
    title: page.data.title,
    description: page.data.description,
    site: "My App",
    fonts: [
      {
        name: "Roboto",
        // Use `fs` (Node.js only) or `fetch` to read the font as Buffer/ArrayBuffer and provide `data` here.
        data: await fetch(
          "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
        ).then((res) => res.arrayBuffer()),
        weight: 400,
        style: "normal",
      },
    ],
  });
});

export function generateStaticParams() {
  return metadataImage.generateParams();
}
