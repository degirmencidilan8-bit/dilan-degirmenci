import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { Corners } from "@/components/Corners";
import { Cursor } from "@/components/Cursor";
import "./globals.css";

// Two faces, both sans. Archivo carries every NAME and NUMBER set large —
// it is a variable font with a width axis as well as weight, which is what
// lets thirteen projects speak in thirteen tones without thirteen
// typefaces. Inter carries everything you read as a sentence, and every
// label, where its narrower shapes hold up at 10px.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
});

// latin-ext, not latin: Arkadaş Basım and Kreş Marka Bakımevi need ş and
// the labels are set in this face too.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "800"],
});

// The technical voice: navigation, captions, labels, and on the About page
// the studio's own paragraph, set in capitals the way the structure this
// site follows sets its own. One weight only.
const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Dilan&Batuhan",
  description:
    "Dilan&Batuhan — a photography and film duo working across editorial, campaign and documentary forms.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} ${mono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-ink text-paper">
        {children}
        {/* The navigation: four corner words and, off the opening page, the
            name. Everything else that used to frame the page — a header
            bar, a status bar, an iris wipe between pages — is gone. The
            pointer is a viewfinder (see Cursor). */}
        <Corners />
        <div className="grain-fixed" aria-hidden />
        <Cursor />
      </body>
    </html>
  );
}
