import { Card, CardContent } from '@/components/ui/card';

export function AboutSection() {
  return (
    <section id="about" className="py-16">
      <div className="container max-w-4xl">
        <h2 className="text-3xl font-bold mb-8 text-center">O projekcie</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-3">Cel projektu</h3>
              <p className="text-muted-foreground">
                Cola z Kranu to platforma obywatelska, ktora umozliwia mieszkancom Polski zglaszanie problemow
                z jakoscia wody. Nasze dane pomagaja identyfikowac obszary wymagajace interwencji i zwiekszaja
                swiadomosc spoleczna na temat jakosci wody.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-3">Jak to dziala?</h3>
              <p className="text-muted-foreground">
                Wypelnij prosty formularz, podajac lokalizacje i rodzaj problemu. Twoje zgloszenie pojawi sie
                na mapie i bedzie dostepne dla innych uzytkownikow. Wszystkie dane sa anonimowe i sluza
                wylacznie celom informacyjnym.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-3">Prywatnosc</h3>
              <p className="text-muted-foreground">
                Dbamy o Twoja prywatnosc. Email kontaktowy jest opcjonalny i nie jest publikowany.
                Mozesz usunac swoje zgloszenie w ciagu 24 godzin. Projekt jest zgodny z RODO.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-3">Open Source</h3>
              <p className="text-muted-foreground">
                Cola z Kranu to projekt open source. Kod zrodlowy jest dostepny na GitHubie.
                Zachecamy do wspolpracy i zglaszania uwag.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
