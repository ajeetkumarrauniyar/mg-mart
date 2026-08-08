import InvitationCardA5 from '@/components/invitation-card-a5'
import { ConfettiEffect } from '@/components/confetti-effect'

export default function A5Page() {
    return (
        <main className="min-h-screen bg-gray-100 py-8">
            <ConfettiEffect />
            <InvitationCardA5 />
        </main>
    )
}
