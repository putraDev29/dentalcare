import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OKAY Dental - Sistem Manajemen Praktek Dokter Gigi & Odontogram",
  description: "Aplikasi Manajemen Klinik Gigi Modern OKAY Dental",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.remove('dark');
                  localStorage.removeItem('theme');
                } catch(e) {}
                function isolateInjectedExtensions() {
                  try {
                    var el = document.getElementById('chromane-theme-root');
                    if (el && el.parentNode === document.body) {
                      document.documentElement.appendChild(el);
                    }
                  } catch (e) {}
                }
                if (typeof MutationObserver !== 'undefined') {
                  var obs = new MutationObserver(function() {
                    isolateInjectedExtensions();
                  });
                  obs.observe(document.documentElement, { childList: true, subtree: true });
                }
                isolateInjectedExtensions();
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
