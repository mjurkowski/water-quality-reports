import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
// import { ReportFormSection } from './components/sections/ReportFormSection';
import { MapSection } from './components/sections/MapSection';
// import { StatsSection } from './components/sections/StatsSection';
import { AboutSection } from './components/sections/AboutSection';

function App() {
  const handleReportClick = () => {
    // Scroll to map so user can place marker
    document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection onReportClick={handleReportClick} />
        {/* <ReportFormSection /> */}
        <MapSection />
        {/* <StatsSection /> */}
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
