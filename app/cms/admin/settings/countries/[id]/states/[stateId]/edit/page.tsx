import EditStatePage from "./EditStatePage";

interface PageProps {
    params: Promise<{ id: string; stateId: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { id, stateId } = await params;
    return <EditStatePage countryId={id} stateId={stateId} />;
};

export default Page;
