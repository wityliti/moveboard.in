import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Moveboard™ Flow — Active Standing Board",
    template: "%s | Moveboard™",
  },
  description:
    "Moveboard™ Flow is a premium active standing board designed in India. Make movement intuitive — not forced, not extreme, just natural.",
  openGraph: {
    title: "Moveboard™ Flow — Active Standing Board",
    description:
      "The active standing board that makes movement intuitive. Designed in India, crafted for the modern workspace.",
    siteName: "Moveboard",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="dark" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0a] text-white antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
