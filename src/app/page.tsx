'use client'

import { Header } from '@/components/layout/Header'
import { JoinBillForm } from '@/components/bill/ShareBill'
import Link from 'next/link'
import { Receipt, Users, Calculator, Zap, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header showNav={true} />

      <main className="container py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" />
            <h1 className="relative text-4xl md:text-5xl font-bold">
              Split Bills
              <span className="block text-gradient">Effortlessly</span>
            </h1>
          </div>

          <p className="text-lg text-[var(--text-secondary)] max-w-md mx-auto">
            Select your items, and we&apos;ll calculate everyone&apos;s share including
            tax and tips automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/bill/new" className="btn btn-primary">
              <Receipt size={20} />
              Create New Bill
              <ArrowRight size={16} />
            </Link>
            <Link href="/join" className="btn btn-secondary">
              <Users size={20} />
              Join a Bill
            </Link>
          </div>
        </section>

        {/* Quick Join */}
        <section className="glass-card p-6 animate-slide-up">
          <h2 className="text-lg font-semibold mb-4 text-center">
            Have a code? Join instantly
          </h2>
          <JoinBillForm />
        </section>

        {/* Features */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-center">How It Works</h2>

          <div className="grid gap-4">
            <FeatureCard
              icon={<Receipt className="text-[var(--primary)]" size={24} />}
              title="Add Items"
              description="Enter bill items manually or scan your receipt"
            />
            <FeatureCard
              icon={<Users className="text-[var(--secondary)]" size={24} />}
              title="Invite Friends"
              description="Share a code so everyone can join and select their items"
            />
            <FeatureCard
              icon={<Calculator className="text-[var(--accent)]" size={24} />}
              title="Auto Calculate"
              description="Tax and tips distributed proportionally based on selections"
            />
            <FeatureCard
              icon={<Zap className="text-[var(--warning)]" size={24} />}
              title="Settle Up"
              description="See who owes what and track payments"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container py-8 text-center text-sm text-[var(--text-muted)]">
        <p>Made with ❤️ for hassle-free bill splitting</p>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="glass-card p-4 flex items-start gap-4 animate-slide-up">
      <div className="w-12 h-12 rounded-xl bg-[var(--surface-elevated)] flex-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
    </div>
  )
}
