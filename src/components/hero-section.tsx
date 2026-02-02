import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
      <div className="flex flex-col items-center text-center space-y-8">
        {/* Profile Image Placeholder */}
        <div className="relative">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20">
            <span className="text-5xl sm:text-6xl font-bold text-primary/60">M</span>
          </div>
        </div>

        {/* Name and Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Your Name
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground font-medium">
            Software Engineer
          </p>
        </div>

        {/* Introduction */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Building modern web applications with a focus on clean code, user experience,
          and scalable architecture. Passionate about creating solutions that make a difference.
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button asChild size="lg" className="min-w-[160px]">
            <Link href="/projects">View Projects</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[160px]">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
