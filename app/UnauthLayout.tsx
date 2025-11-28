import ApplicationClient from "./ApplicationClient";
import { Footer } from "./Footer";
import NavBar from "./NavBar";

export default function UnauthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <NavBar />
            <ApplicationClient>{children}</ApplicationClient>
            <Footer />
        </>
    );
}
