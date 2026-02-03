import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Github, Code2 } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Available for new opportunities
          </div>

          {/* Name and Title */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block text-foreground">Hi, I'm</span>
              <span className="block text-gradient mt-2">Matt Barrett</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground font-medium flex items-center justify-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              Software Engineer
            </p>
          </div>

          {/* Introduction */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed text-balance">
            I build modern web applications and data solutions with a focus on
            <span className="text-foreground font-medium"> clean architecture</span>,
            <span className="text-foreground font-medium"> user experience</span>, and
            <span className="text-foreground font-medium"> scalable systems</span>.
          </p>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button asChild size="lg" className="min-w-[180px] bg-gradient hover:opacity-90 transition-opacity group">
              <Link href="/projects">
                View My Work
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[180px] group">
              <a href="https://github.com/8arr3tt" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 text-sm text-muted-foreground w-full max-w-md">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">5+</span>
              <span className="text-xs sm:text-sm">Years Exp.</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">10+</span>
              <span className="text-xs sm:text-sm">Projects</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">3+</span>
              <span className="text-xs sm:text-sm">OSS Packages</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
