import AddStatePage from "./AddStatePage";

interface PageProps {
    params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { id } = await params;
    return <AddStatePage countryId={id} />;
};

export default Page;
