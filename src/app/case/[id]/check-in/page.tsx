import CheckInClient from '@/components/clients/CheckInClient';

export function generateStaticParams() {
    return [{ id: 'demo' }];
}

export default function CheckInPage({ params }: { params: { id: string } }) {
    return <CheckInClient id={params.id} />;
}
