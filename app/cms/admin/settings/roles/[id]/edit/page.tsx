import EditRolePage from "./EditRolePage";

interface PageProps {
    params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { id } = await params;
    return <EditRolePage id={id} />;
};

export default Page;
