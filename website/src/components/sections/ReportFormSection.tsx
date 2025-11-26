import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePostReportsMutation } from '@/lib/api/generatedApi';
import { REPORT_TYPE_LABELS } from '@/lib/utils/utils';
import { PhotoUpload, PhotoData } from '@/components/custom/PhotoUpload';

type ReportType = 'brown_water' | 'bad_smell' | 'sediment' | 'pressure' | 'no_water' | 'other';

const reportSchema = z.object({
  types: z.array(z.enum(['brown_water', 'bad_smell', 'sediment', 'pressure', 'no_water', 'other']))
    .min(1, 'Wybierz przynajmniej jeden typ problemu')
    .refine(
      (types) => {
        // If "no_water" is selected, it must be the only selection
        if (types.includes('no_water') && types.length > 1) {
          return false;
        }
        return true;
      },
      { message: 'Opcja "Brak wody" nie może być łączona z innymi typami' }
    ),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  city: z.string().optional(),
  contactEmail: z.string().email('Nieprawidlowy email').optional().or(z.literal('')),
  photos: z.array(z.object({
    base64: z.string(),
    mimeType: z.string(),
  })).max(5, 'Maksymalnie 5 zdjęć').optional(),
  dataProcessingConsent: z.boolean().refine((val) => val === true, {
    message: 'Musisz wyrazić zgodę na przetwarzanie danych',
  }),
});

type ReportFormData = z.infer<typeof reportSchema>;

export function ReportFormSection() {
  const [selectedTypes, setSelectedTypes] = useState<ReportType[]>([]);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [createReport, { isLoading, isSuccess }] = usePostReportsMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      types: [],
      latitude: 52.0,
      longitude: 19.0,
      photos: [],
      dataProcessingConsent: false,
    },
  });

  const toggleType = (type: ReportType) => {
    let newTypes: ReportType[];

    if (selectedTypes.includes(type)) {
      // Deselect the type
      newTypes = selectedTypes.filter((t) => t !== type);
    } else {
      // Select the type
      if (type === 'no_water') {
        // If selecting "no_water", clear all other selections
        newTypes = ['no_water'];
      } else if (selectedTypes.includes('no_water')) {
        // If "no_water" is already selected, replace it with the new type
        newTypes = [type];
      } else {
        // Normal selection - no limit
        newTypes = [...selectedTypes, type];
      }
    }

    setSelectedTypes(newTypes);
    setValue('types', newTypes);
  };

  const handlePhotosChange = (newPhotos: PhotoData[]) => {
    setPhotos(newPhotos);
    setValue('photos', newPhotos);
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      // Convert PhotoData[] to string[] (base64 data URLs)
      const photoStrings = photos.length > 0
        ? photos.map(photo => `data:${photo.mimeType};base64,${photo.base64}`)
        : undefined;

      // Remove dataProcessingConsent from the data before sending
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dataProcessingConsent, ...reportData } = data;

      await createReport({
        createReportRequest: {
          ...reportData,
          photos: photoStrings,
          reportedAt: new Date().toISOString(),
        },
      }).unwrap();
      reset();
      setSelectedTypes([]);
      setPhotos([]);
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  if (isSuccess) {
    return (
      <section id="report" className="py-16 bg-muted/30">
        <div className="container max-w-2xl">
          <Card>
            <CardContent className="pt-6 text-center">
              <h3 className="text-2xl font-bold text-green-600 mb-2">Dziekujemy za zgloszenie!</h3>
              <p className="text-muted-foreground">Twoje zgloszenie zostalo przyjete i pojawi sie na mapie.</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Zglos kolejny problem
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="report" className="py-16 bg-muted/30">
      <div className="container max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Zglos problem z woda</CardTitle>
            <CardDescription>Wypelnij formularz, aby zglosic problem z jakoscia wody w Twojej okolicy.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Typ problemu</Label>
                <p className="text-sm text-muted-foreground">Wybierz typ(y) problemu. Uwaga: "Brak wody" wyklucza inne opcje.</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleType(value as ReportType)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedTypes.includes(value as ReportType)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input hover:bg-accent'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {errors.types && <p className="text-sm text-destructive">{errors.types.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Opis (opcjonalnie)</Label>
                <Textarea id="description" placeholder="Opisz problem..." {...register('description')} />
              </div>

              <div className="space-y-2">
                <Label>Zdjęcia (opcjonalnie)</Label>
                <PhotoUpload photos={photos} onChange={handlePhotosChange} />
                {errors.photos && <p className="text-sm text-destructive">{errors.photos.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Szerokosc geogr.</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    {...register('latitude', { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Dlugosc geogr.</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    {...register('longitude', { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adres (opcjonalnie)</Label>
                <Input id="address" placeholder="ul. Przykladowa 1, Warszawa" {...register('address')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Miasto</Label>
                <Input id="city" placeholder="Warszawa" {...register('city')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email kontaktowy (opcjonalnie)</Label>
                <Input id="contactEmail" type="email" placeholder="jan@example.com" {...register('contactEmail')} />
                {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="dataProcessingConsent"
                    {...register('dataProcessingConsent')}
                    onCheckedChange={(checked) => setValue('dataProcessingConsent', checked === true)}
                  />
                  <Label
                    htmlFor="dataProcessingConsent"
                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji zgłoszenia oraz publikacji informacji o zgłoszeniu na mapie. Podanie danych jest dobrowolne, ale niezbędne do realizacji zgłoszenia.
                  </Label>
                </div>
                {errors.dataProcessingConsent && (
                  <p className="text-sm text-destructive">{errors.dataProcessingConsent.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Wysylanie...' : 'Wyslij zgloszenie'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
