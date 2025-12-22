import { ClipboardList, Camera, Key, AlertCircle } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export default function MoveOutPage() {
    const checklistItems = [
        { id: 1, label: 'Take final photos of each room', icon: Camera, done: false },
        { id: 2, label: 'Document any changes since check-in', icon: AlertCircle, done: false },
        { id: 3, label: 'Collect all keys to return', icon: Key, done: false },
        { id: 4, label: 'Read meter readings', icon: ClipboardList, done: false },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-1">Move-out</h1>
                <p className="text-slate-500 text-sm">
                    Prepare for your handover with this checklist.
                </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h3 className="font-semibold mb-4">Handover checklist</h3>

                <div className="space-y-3">
                    {checklistItems.map(item => (
                        <label
                            key={item.id}
                            className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                            <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-2 border-slate-300 text-slate-900 focus:ring-slate-500"
                            />
                            <div className="flex items-center gap-3 flex-1">
                                <item.icon size={18} className="text-slate-400" />
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Compact disclaimer */}

        </div>
    )
}
