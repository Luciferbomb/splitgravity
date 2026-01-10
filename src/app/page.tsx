'use client'

import { Header } from '@/components/layout/Header'
import { JoinBillForm } from '@/components/bill/ShareBill'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import Link from 'next/link'
import { Users, Calculator, Zap, ScanLine, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { FadeIn, SlideIn, Stagger, StaggerItem, ScaleIn } from '@/components/animation'
import { transition, variants } from '@/lib/animations'
import { GlassButton } from '@/components/ui/GlassButton'
import { FloatingElement } from '@/components/ui/FloatingElement'

const items = [
  {
    title: "AI Receipt Scanning",
    description: "Upload a photo and let our AI extract items and prices automatically with high precision.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl glass-gradient flex items-center justify-center"><ScanLine className="h-8 w-8 text-indigo-400" /></div>,
    icon: <ScanLine className="h-4 w-4 text-indigo-400" />,
  },
  {
    title: "Real-time Sync",
    description: "Everyone selects their own items on their own phone simultaneously. No more passing the receipt around.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl glass-gradient flex items-center justify-center"><Users className="h-8 w-8 text-blue-400" /></div>,
    icon: <Users className="h-4 w-4 text-blue-400" />,
  },
  {
    title: "Smart Math",
    description: "We handle tax, service charges, and discounts proportionally. Fair splitting, every time.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl glass-gradient flex items-center justify-center"><Calculator className="h-8 w-8 text-emerald-400" /></div>,
    icon: <Calculator className="h-4 w-4 text-emerald-400" />,
  },
  {
    title: "Instant Settlement",
    description: "See exactly who owes whom to minimize transactions. Settle up via UPI or cash instantly.",
    header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl glass-gradient flex items-center justify-center"><Zap className="h-8 w-8 text-amber-400" /></div>,
    icon: <Zap className="h-4 w-4 text-amber-400" />,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <Header showNav={true} />

      {/* Animated gradient mesh background */}
      <div className="fixed inset-0 gradient-mesh opacity-40 pointer-events-none" />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="container relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <ScaleIn delay={0.1}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-heavy text-indigo-300 text-sm font-medium mb-4">
                  <motion.span
                    className="flex h-2 w-2 rounded-full bg-indigo-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Sparkles className="w-4 h-4" />
                  v2.0 Ultra is now live
                </div>
              </ScaleIn>

              <FadeIn delay={0.2}>
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white">
                  Split bills with <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    precision & ease.
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  Stop doing math at the dinner table. Scan your receipt, tap your items, and let 19-20 handle the tax, tip, and settlements instantly.
                </p>
              </FadeIn>

              <SlideIn direction="up" delay={0.4}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                  <Link href="/bill/new">
                    <GlassButton variant="gradient" className="group">
                      <ScanLine className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Start Scanning
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </GlassButton>
                  </Link>
                  <Link href="/join">
                    <GlassButton variant="heavy" className="group">
                      <Users className="w-5 h-5 mr-2" />
                      Join Bill
                    </GlassButton>
                  </Link>
                </div>
              </SlideIn>

              {/* Floating glass cards */}
              <div className="pt-16 relative h-64">
                <FloatingElement speed={0.3} className="absolute top-0 left-[10%]">
                  <motion.div
                    className="glass-ultra p-6 rounded-2xl depth-1"
                    whileHover={{ scale: 1.05, rotateZ: 2 }}
                  >
                    <div className="text-4xl font-bold text-white">₹0</div>
                    <div className="text-sm text-slate-300 mt-1">Math, done</div>
                  </motion.div>
                </FloatingElement>

                <FloatingElement speed={0.5} className="absolute top-8 right-[15%]">
                  <motion.div
                    className="glass-ultra p-6 rounded-2xl depth-2"
                    whileHover={{ scale: 1.05, rotateZ: -2 }}
                  >
                    <div className="text-3xl">⚡</div>
                    <div className="text-sm text-slate-300 mt-1">Instant</div>
                  </motion.div>
                </FloatingElement>

                <FloatingElement speed={0.7} className="absolute bottom-0 left-[50%] -translate-x-1/2">
                  <motion.div
                    className="glass-ultra p-6 rounded-2xl depth-3"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-red-500" />
                    </div>
                    <div className="text-sm text-slate-300 mt-2">Split fairly</div>
                  </motion.div>
                </FloatingElement>
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 left-0 right-0 h-full overflow-hidden -z-10 pointer-events-none">
            <motion.div
              className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-3xl"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </div>
        </section>

        {/* Quick Join Section */}
        <section className="py-12 border-y border-white/10">
          <div className="container">
            <div className="max-w-md mx-auto">
              <ScaleIn delay={0.2}>
                <div className="glass-heavy p-8 rounded-2xl">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-white flex items-center justify-center gap-2">
                      <Zap size={18} className="text-amber-400" />
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
        <section className="py-24">
          <div className="container space-y-16">
            <FadeIn delay={0.1}>
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Everything you need</h2>
                <p className="text-slate-300 text-lg">Designed for the modern dining experience. Simple, fast, and accurate.</p>
              </div>
            </FadeIn>

            <Stagger staggerDelay={0.1}>
              <BentoGrid className="max-w-6xl mx-auto">
                {items.map((item, i) => (
                  <StaggerItem key={i}>
                    <motion.div
                      className="glass-heavy rounded-xl p-6 h-full"
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={transition.spring}
                    >
                      <BentoGridItem
                        title={item.title}
                        description={item.description}
                        header={item.header}
                        icon={item.icon}
                        className="bg-transparent border-0 shadow-none text-white"
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
      <footer className="border-t border-white/10 py-12">
        <div className="container text-center">
          <FadeIn delay={0.2}>
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} 19-20. Made with ❤️ for hassle-free bill splitting.
            </p>
          </FadeIn>
        </div>
      </footer>
    </div>
  )
}

