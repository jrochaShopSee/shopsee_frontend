import RoleCapabilitiesPage from "./RoleCapabilitiesPage";

interface PageProps {
    params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { id } = await params;
    return <RoleCapabilitiesPage id={id} />;
};

export default Page;
