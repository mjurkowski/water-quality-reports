export function Footer() {
  return (
    <footer className="border-t py-8 bg-muted/50">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold">Cola z Kranu</p>
            <p className="text-sm text-muted-foreground">Platforma obywatelska do zglaszania problemow z woda</p>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Cola z Kranu. Projekt open source.
          </div>
        </div>
      </div>
    </footer>
  );
}
