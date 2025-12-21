import CaseOverviewClient from '@/components/clients/CaseOverviewClient';

export function generateStaticParams() {
    return [{ id: 'demo' }];
}

export default function CaseOverview({ params }: { params: { id: string } }) {
    return <CaseOverviewClient id={params.id} />;
}
