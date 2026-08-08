import InvitationCard from '@/components/invitation-card'
import { ConfettiEffect } from '@/components/confetti-effect'

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <ConfettiEffect />
      <InvitationCard />
    </main>
  )
}
