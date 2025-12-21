'use client';

import { useState } from 'react';
import { useCaseStore } from '@/store/useCaseStore';
import { saveFile, generateId } from '@/lib/storage';
import { Camera, Plus, Check } from 'lucide-react';

export default function CheckInClient({ id }: { id: string }) {
    const { getCase, updateCase } = useCaseStore();
    const rentalCase = getCase(id);
    const [uploading, setUploading] = useState<string | null>(null);

    if (!rentalCase) return null;

    const handleAddRoom = () => {
        const newRoom = { id: generateId(), name: 'New Room', photos: 0, status: 'Empty' as const };
        updateCase(id, {
            rooms: [...rentalCase.rooms, newRoom]
        });
    };

    const handlePhotoUpload = async (roomId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(roomId);
        try {
            const fileId = generateId();
            await saveFile(fileId, file);
            const updatedRooms = rentalCase.rooms.map(r => {
                if (r.id === roomId) {
                    return { ...r, photos: r.photos + 1, status: 'In Progress' as const };
                }
                return r;
            });
            updateCase(id, { rooms: updatedRooms });
        } finally {
            setUploading(null);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Check-in Evidence</h1>
                </div>
                <button className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem' }}>
                    <Check size={18} /> Generate PDF Report
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {rentalCase.rooms.map((room) => (
                    <div key={room.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ height: '150px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', position: 'relative' }}>
                            {/* Image Preview Logic Omitted for Brevity in Client Refactor */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <Camera size={24} />
                                <span style={{ fontSize: '0.875rem' }}>{room.photos} Photos</span>
                            </div>

                            {uploading === room.id && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    Saving...
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <h3 style={{ fontWeight: 600 }}>{room.name}</h3>
                                <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: '#F3F4F6', borderRadius: '100px' }}>{room.status}</span>
                            </div>

                            <label className="btn btn-outline" style={{ width: '100%', fontSize: '0.875rem', padding: '0.5rem', cursor: 'pointer', textAlign: 'center' }}>
                                + Add Photo
                                <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(room.id, e)} style={{ display: 'none' }} />
                            </label>
                        </div>
                    </div>
                ))}

                <button onClick={handleAddRoom} style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)', minHeight: '300px', background: 'transparent' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Plus size={24} /> <span style={{ fontWeight: 500 }}>Add Room</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
