
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MONOPOLY_RULES } from '@/lib/rules';

export default function RulesPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center">
            Monopoly Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm md:prose-base max-w-none">
          {MONOPOLY_RULES.map((section, index) => (
            <div key={index} className="mb-6">
              <h2 className="font-headline text-2xl font-bold mb-2">{section.title}</h2>
              <ul className="list-disc pl-5 space-y-2">
                {section.points.map((point, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: point }}></li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="mt-6 text-center">
        <Link href="/" passHref>
            <Button>Back to Game</Button>
        </Link>
      </div>
    </main>
  );
}
