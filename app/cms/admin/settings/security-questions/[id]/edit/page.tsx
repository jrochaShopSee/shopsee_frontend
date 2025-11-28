import EditSecurityQuestionPage from "./EditSecurityQuestionPage";

interface PageProps {
    params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { id } = await params;
    return <EditSecurityQuestionPage id={id} />;
};

export default Page;
