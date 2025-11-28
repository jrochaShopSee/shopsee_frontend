import EditAddressPage from "./EditAddressPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <EditAddressPage id={id} />;
}
