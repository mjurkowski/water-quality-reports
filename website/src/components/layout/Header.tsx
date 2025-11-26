import { Button } from '@/components/ui/button';

export function Header() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">Cola z Kranu</span>
        </a>
        <nav className="hidden md:flex items-center space-x-6">
          <button onClick={() => scrollTo('report')} className="text-sm font-medium hover:text-primary transition-colors">
            Zglos problem
          </button>
          <button onClick={() => scrollTo('map')} className="text-sm font-medium hover:text-primary transition-colors">
            Mapa
          </button>
          <button onClick={() => scrollTo('stats')} className="text-sm font-medium hover:text-primary transition-colors">
            Statystyki
          </button>
          <button onClick={() => scrollTo('about')} className="text-sm font-medium hover:text-primary transition-colors">
            O projekcie
          </button>
        </nav>
        <Button onClick={() => scrollTo('report')} size="sm">
          Zglos teraz
        </Button>
      </div>
    </header>
  );
}
