import EditCurrencyPage from "./EditCurrencyPage";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    return <EditCurrencyPage id={id} />;
}
