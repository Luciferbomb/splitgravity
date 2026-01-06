'use client'

import { Header } from '@/components/layout/Header'
import { JoinBillForm } from '@/components/bill/ShareBill'

export default function JoinPage() {
    return (
        <div className="min-h-screen">
            <Header title="Join a Bill" showBack={true} showNav={false} />

            <main className="container py-8 max-w-md mx-auto">
                <div className="glass-card p-6 space-y-6 animate-slide-up">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold">Join a Bill</h1>
                        <p className="text-[var(--text-secondary)]">
                            Enter the 6-character code shared by your friend
                        </p>
                    </div>

                    <JoinBillForm />
                </div>
            </main>
        </div>
    )
}
