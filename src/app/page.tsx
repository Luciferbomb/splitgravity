'use client'

import { Header } from '@/components/layout/Header'
import { JoinBillForm } from '@/components/bill/ShareBill'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import Link from 'next/link'
import { Users, Calculator, Zap, ScanLine, ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { FadeIn, SlideIn, Stagger, StaggerItem, ScaleIn } from '@/components/animation'
import { transition, variants } from '@/lib/animations'

const items = [
  {
    title: "AI Receipt Scanning",
    description: "Upload a photo and let our AI extract items and prices automatically with high precision.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center"><ScanLine className="h-8 w-8 text-indigo-600" /></div>,
    icon: <ScanLine className="h-4 w-4 text-indigo-600" />,
  },
  {
    title: "Real-time Sync",
    description: "Everyone selects their own items on their own phone simultaneously. No more passing the receipt around.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center"><Users className="h-8 w-8 text-blue-600" /></div>,
    icon: <Users className="h-4 w-4 text-blue-600" />,
  },
  {
    title: "Smart Math",
    description: "We handle tax, service charges, and discounts proportionally. Fair splitting, every time.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center"><Calculator className="h-8 w-8 text-emerald-600" /></div>,
    icon: <Calculator className="h-4 w-4 text-emerald-600" />,
  },
  {
    title: "Instant Settlement",
    description: "See exactly who owes whom to minimize transactions. Settle up via UPI or cash instantly.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center"><Zap className="h-8 w-8 text-amber-600" /></div>,
    icon: <Zap className="h-4 w-4 text-amber-600" />,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header showNav={true} />

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <ScaleIn delay={0.1}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-4">
                  <motion.span
                    className="flex h-2 w-2 rounded-full bg-indigo-600"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  v2.0 is now live
                </div>
              </ScaleIn>

              <FadeIn delay={0.2}>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900">
                  Split bills with <br />
                  <span className="text-indigo-600">precision & ease.</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Stop doing math at the dinner table. Scan your receipt, tap your items, and let 19-20 handle the tax, tip, and settlements instantly.
                </p>
              </FadeIn>

              <SlideIn direction="up" delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/bill/new"
                      className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <ScanLine className="w-5 h-5 mr-2" />
                      Start Scanning
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/join"
                      className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-700 transition-all bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Join Bill
                    </Link>
                  </motion.div>
                </div>
              </SlideIn>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 left-0 right-0 h-full overflow-hidden -z-10 pointer-events-none">
            <motion.div
              className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.6, 0.5] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </div>
        </section>

        {/* Quick Join Section */}
        <section className="py-12 bg-white border-y border-slate-100">
          <div className="container">
            <div className="max-w-md mx-auto">
              <ScaleIn delay={0.2}>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center justify-center gap-2">
                      <Zap size={18} className="text-amber-500" />
                      Have a code? Join instantly
                    </h2>
                  </div>
                  <JoinBillForm />
                </div>
              </ScaleIn>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-slate-50">
          <div className="container space-y-16">
            <FadeIn delay={0.1}>
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Everything you need</h2>
                <p className="text-slate-600 text-lg">Designed for the modern dining experience. Simple, fast, and accurate.</p>
              </div>
            </FadeIn>

            <Stagger staggerDelay={0.1}>
              <BentoGrid className="max-w-6xl mx-auto">
                {items.map((item, i) => (
                  <StaggerItem key={i}>
                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={transition.spring}
                    >
                      <BentoGridItem
                        title={item.title}
                        description={item.description}
                        header={item.header}
                        icon={item.icon}
                        className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all"
                      />
                    </motion.div>
                  </StaggerItem>
                ))}
              </BentoGrid>
            </Stagger>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container text-center">
          <FadeIn delay={0.2}>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} 19-20. Made with ❤️ for hassle-free bill splitting.
            </p>
          </FadeIn>
        </div>
      </footer>
    </div>
  )
}

