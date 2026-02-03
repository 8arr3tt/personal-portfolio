'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, isActiveRoute } from '@/lib/navigation'
import { useState } from 'react'

export function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
        {/* Logo/Name */}
        <Link
          href="/"
          className="flex items-center gap-2 group mr-8"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient text-primary-foreground">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight group-hover:text-gradient transition-all duration-300">
            Matt Barrett
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md',
                isActiveRoute(pathname, item.href)
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              {item.label}
              {/* Active indicator */}
              {isActiveRoute(pathname, item.href) && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-primary rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="desktop-nav flex-1" />

        {/* Desktop Theme Toggle */}
        <div className="desktop-nav items-center gap-2 ml-auto">
          <ThemeToggle />
        </div>

        {/* Mobile Menu */}
        <div className="mobile-nav items-center gap-1 ml-auto">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-accent/50"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-l border-border/40">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient text-primary-foreground">
                    <Code2 className="w-3 h-3" />
                  </div>
                  Navigation
                </SheetTitle>
                <SheetDescription>
                  Explore the portfolio
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-8">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center px-3 py-3 text-base font-medium transition-all rounded-lg',
                      isActiveRoute(pathname, item.href)
                        ? 'text-foreground bg-accent/80 shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    {item.label}
                    {isActiveRoute(pathname, item.href) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                ))}
              </nav>
              {/* Mobile footer */}
              <div className="absolute bottom-8 left-6 right-6">
                <div className="pt-6 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">
                    Software Engineer
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
