import EditCountryPage from "./EditCountryPage";

interface PageProps {
    params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { id } = await params;
    return <EditCountryPage id={id} />;
};

export default Page;
