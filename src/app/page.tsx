import Link from 'next/link'
import { HeroSection } from '@/components/hero-section'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/projects/project-card'
import { getFeaturedProjects, getPublishedProjects } from '@/data/projects'

export default function Home() {
  const featuredProjects = getFeaturedProjects()
  const allProjects = getPublishedProjects()

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <HeroSection />

      <Separator className="w-full max-w-5xl" />

      {/* Featured Projects Preview */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Featured Projects
            </h2>
            <p className="text-muted-foreground text-lg">
              Showcase of recent work and contributions
            </p>
          </div>

          {featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProjects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {allProjects.length > featuredProjects.length && (
            <div className="flex justify-center pt-4">
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">View All Projects</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <Separator className="w-full max-w-5xl" />

      {/* Skills/Technologies Section */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Skills & Technologies
            </h2>
            <p className="text-muted-foreground text-lg">
              Tools and frameworks I work with
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'React',
              'Next.js',
              'TypeScript',
              'Node.js',
              'Tailwind CSS',
              'Git',
              'Docker',
              'More...',
            ].map((skill) => (
              <Card key={skill} className="text-center p-6 hover:shadow-md transition-shadow">
                <p className="font-medium">{skill}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
