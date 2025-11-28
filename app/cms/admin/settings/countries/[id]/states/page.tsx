import StatesPage from "./StatesPage";

interface PageProps {
    params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { id } = await params;
    return <StatesPage countryId={id} />;
};

export default Page;
