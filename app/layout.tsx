import type { Metadata } from "next";
import localFont from "next/font/local";
import "./css/globals.css";
import "./css/spinner.css";
import "./css/step.css";
import UnauthLayout from "./UnauthLayout";
import CmsLayout from "./components/cms/CmsLayout";
import LayoutProvider from "./LayoutProvider";
import CmsAuthWrapper from "./components/cms/CmsAuthWrapper";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "ShopSee",
    description: "Make your videos interactible",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <LayoutProvider
                    cmsLayout={
                        <CmsAuthWrapper requireAdmin>
                            <CmsLayout>{children}</CmsLayout>
                        </CmsAuthWrapper>
                    }
                    unauthLayout={<UnauthLayout>{children}</UnauthLayout>}
                >
                    {children}
                </LayoutProvider>
            </body>
        </html>
    );
}
