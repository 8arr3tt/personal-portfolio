import { HeroSection } from '@/components/hero-section'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function Home() {
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-md mb-4 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Project Preview</span>
                  </div>
                  <CardTitle>Coming Soon</CardTitle>
                  <CardDescription>
                    Project details will be added in the next phase
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">
                    This section will showcase featured projects with descriptions,
                    technologies used, and links to live demos and repositories.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
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
