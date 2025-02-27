import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import Head from "next/head";
import "./globals.css";
import { Providers } from "./providers";
import localFont from 'next/font/local'

// const inter = Inter({ subsets: ["latin"] });
const myFont = localFont({
  src: [
    {
      path: './assets/fonts/DB_v4.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './assets/fonts/DB_Med_v4.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
})


export const metadata: Metadata = {
  title: "ร้านอาหารใต้จิก",
  description: "Test LIFF application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className='light'>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <body className={myFont.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
