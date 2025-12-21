import CaseLayoutClient from '@/components/clients/CaseLayoutClient';

export function generateStaticParams() {
    return [{ id: 'demo' }];
}

export default function CaseLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { id: string };
}) {
    return <CaseLayoutClient id={params.id}>{children}</CaseLayoutClient>;
}
