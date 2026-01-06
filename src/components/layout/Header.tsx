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
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="container flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <button
                            onClick={() => router.back()}
                            className="btn-ghost p-2 rounded-full hover:bg-slate-100"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                    )}
                    {title ? (
                        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
                    ) : (
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
                                <Receipt size={18} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">19-20</span>
                        </Link>
                    )}
                </div>

                {action && <div>{action}</div>}
            </div>

            {showNav && !showBack && (
                <div className="container pb-2 flex justify-center gap-2">
                    <NavLink href="/" active={pathname === '/'}>
                        <Home size={16} />
                        Home
                    </NavLink>
                    <NavLink href="/bill/new" active={pathname === '/bill/new'}>
                        <Receipt size={16} />
                        New Bill
                    </NavLink>
                    <NavLink href="/join" active={pathname === '/join'}>
                        <Users size={16} />
                        Join
                    </NavLink>
                </div>
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
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
        >
            {children}
        </Link>
    )
}
