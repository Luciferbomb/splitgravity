'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Receipt, Users } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

interface HeaderProps {
    title?: string
    showBack?: boolean
    showNav?: boolean
    action?: ReactNode
}

export function Header({ title, showBack = false, showNav = true, action }: HeaderProps) {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-50 glass-card border-0 border-b border-[var(--border)]">
            <div className="container flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <button
                            onClick={() => router.back()}
                            className="btn-ghost p-2 rounded-full"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    {title ? (
                        <h1 className="text-lg font-semibold">{title}</h1>
                    ) : (
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex-center">
                                <Receipt size={18} className="text-white" />
                            </div>
                            <span className="text-lg font-bold text-gradient">SplitGravity</span>
                        </Link>
                    )}
                </div>

                {action && <div>{action}</div>}
            </div>

            {showNav && !showBack && (
                <nav className="container pb-2">
                    <div className="flex gap-1">
                        <NavLink href="/" active={pathname === '/'}>
                            <Home size={16} />
                            <span>Home</span>
                        </NavLink>
                        <NavLink href="/bill/new" active={pathname === '/bill/new'}>
                            <Receipt size={16} />
                            <span>New Bill</span>
                        </NavLink>
                        <NavLink href="/join" active={pathname === '/join'}>
                            <Users size={16} />
                            <span>Join</span>
                        </NavLink>
                    </div>
                </nav>
            )}
        </header>
    )
}

function NavLink({
    href,
    active,
    children,
}: {
    href: string
    active: boolean
    children: ReactNode
}) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${active
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface)]'
                }`}
        >
            {children}
        </Link>
    )
}
