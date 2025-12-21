import ContractClient from '@/components/clients/ContractClient';

export function generateStaticParams() {
    return [{ id: 'demo' }];
}

export default function ContractPage({ params }: { params: { id: string } }) {
    return <ContractClient id={params.id} />;
}
