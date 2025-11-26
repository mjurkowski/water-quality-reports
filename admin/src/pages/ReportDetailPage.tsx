import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGetReportsByUuidQuery } from '@/lib/api/generatedApi';
import { REPORT_TYPE_LABELS, formatDate } from '@/lib/utils/utils';

export function ReportDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: report, isLoading, error } = useGetReportsByUuidQuery({ uuid: uuid! });

  if (isLoading) {
    return <div className="text-muted-foreground">Ladowanie...</div>;
  }

  if (error || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Nie znaleziono zgloszenia</p>
        <Link to="/reports" className="text-primary hover:underline">
          Wrocdo listy
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/reports" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Wrocdo listy
      </Link>

      <h1 className="text-3xl font-bold">Szczegoly zgloszenia</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">UUID</p>
            <p className="font-mono text-sm">{report.uuid}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Typy problemow</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {report.types.map((type) => (
                <span key={type} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                  {REPORT_TYPE_LABELS[type] || type}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Opis</p>
            <p>{report.description || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Data zgloszenia</p>
            <p>{formatDate(report.reportedAt)}</p>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Lokalizacja</p>
            <p>
              {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Adres</p>
            <p>{report.address || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Miasto</p>
            <p>{report.city || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Wojewodztwo</p>
            <p>{report.voivodeship || '-'}</p>
          </div>
        </div>
      </div>

      {report.photos.length > 0 && (
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-3">Zdjecia ({report.photos.length})</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {report.photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt="Zdjecie zgloszenia"
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
