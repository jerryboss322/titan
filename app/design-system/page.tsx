import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto py-12 space-y-12">
      <h1 className="text-4xl font-display font-bold">Design System</h1>

      {/* Buttons */}
      <section>
        <h2 className="text-2xl font-display font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Cards */}
      <section>
        <h2 className="text-2xl font-display font-semibold mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content area.</p>
            </CardContent>
            <CardFooter>
              <Button>Action</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Another Card</CardTitle>
              <CardDescription>With a badge</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge>Badge</Badge>
            </CardContent>
          </Card>
          <Card className="bg-gold/10 border-gold/30">
            <CardHeader>
              <CardTitle>Featured</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This card has a gold accent.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-2xl font-display font-semibold mb-4">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="text-2xl font-display font-semibold mb-4">Inputs</h2>
        <div className="max-w-sm space-y-4">
          <Input placeholder="Default input" />
          <Input placeholder="With icon" />
          <Input type="email" placeholder="Email" />
          <Input disabled placeholder="Disabled" />
        </div>
      </section>

      {/* Skeletons */}
      <section>
        <h2 className="text-2xl font-display font-semibold mb-4">Skeletons</h2>
        <div className="flex gap-6">
          <div className="space-y-2">
            <Skeleton className="h-32 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-32 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </section>
    </div>
  );
}
