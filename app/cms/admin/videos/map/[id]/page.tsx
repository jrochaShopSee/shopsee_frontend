import MapVideoPage from "./MapVideoPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <MapVideoPage videoId={parseInt(id)} />;
}
