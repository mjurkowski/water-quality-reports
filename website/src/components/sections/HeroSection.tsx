import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onReportClick?: () => void;
}

export function HeroSection({ onReportClick }: HeroSectionProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReportClick = () => {
    // Activate add mode if callback provided
    if (onReportClick) {
      onReportClick();
    }
    // Scroll to map so user sees what's happening
    scrollTo('map');
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
      <div className="container text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Zglos problem z <span className="text-primary">jakoscia wody</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Brunatna woda z kranu? Nieprzyjemny zapach? Pomoz nam monitorowac jakosc wody w Polsce.
          Twoje zgloszenie moze pomoc innym mieszkancom.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleReportClick}>
            Zglos problem
          </Button>
          <Button size="lg" variant="outline" onClick={() => scrollTo('map')}>
            Zobacz mape zgloszen
          </Button>
        </div>
      </div>
    </section>
  );
}
