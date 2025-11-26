import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  contactEmail: z.union([
    z.string().email('Nieprawidlowy email'),
    z.literal(''),
  ]).optional(),
  photos: z.array(z.string()).max(5, 'Maksymalnie 5 zdjęć').optional(),
  dataProcessingConsent: z.boolean().refine((val) => val === true, {
    message: 'Musisz wyrazić zgodę na przetwarzanie danych',
  }),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormModalProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  initialCity?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isLoadingAddress?: boolean;
}

export function ReportFormModal({
  initialLat = 52.0,
  initialLng = 19.0,
  initialAddress,
  initialCity,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  isLoadingAddress = false,
}: ReportFormModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ReportType[]>([]);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [createReport, { isLoading, isSuccess }] = usePostReportsMutation();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      types: [],
      latitude: initialLat,
      longitude: initialLng,
      photos: [],
      dataProcessingConsent: false,
    },
  });

  // Update coordinates, address and city when modal opens with new location from map click
  useEffect(() => {
    if (isOpen) {
      setValue('latitude', initialLat);
      setValue('longitude', initialLng);
      if (initialAddress) {
        setValue('address', initialAddress);
      }
      if (initialCity) {
        setValue('city', initialCity);
      }
    }
  }, [isOpen, initialLat, initialLng, initialAddress, initialCity, setValue]);

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
    // Convert PhotoData[] to string[] (base64 data URLs)
    const photoStrings = newPhotos.map(photo => `data:${photo.mimeType};base64,${photo.base64}`);
    setValue('photos', photoStrings);
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      // Remove dataProcessingConsent from the data before sending
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dataProcessingConsent, ...reportData } = data;
      await createReport({
        createReportRequest: {
          ...reportData,
          reportedAt: new Date().toISOString(),
        },
      }).unwrap();
      // Success - form will show success message
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dziękujemy za zgłoszenie!</DialogTitle>
            <DialogDescription>
              Twoje zgłoszenie zostało przyjęte i pojawi się na mapie.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => {
            // Close modal and reload to reset mutation state
            setIsOpen(false);
            window.location.reload();
          }}>
            Zamknij
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Zgłoś problem z wodą</DialogTitle>
          <DialogDescription>
            Wypełnij formularz, aby zgłosić problem z jakością wody w Twojej okolicy.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Typ problemu</Label>
            <p className="text-xs text-muted-foreground">Wybierz typ(y) problemu. Uwaga: "Brak wody" wyklucza inne opcje.</p>
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

          <div className="space-y-2">
            <Label htmlFor="address">Adres{isLoadingAddress && ' (pobieranie...)'}</Label>
            <Input
              id="address"
              placeholder="ul. Przykładowa 1, Warszawa"
              {...register('address')}
              disabled={isLoadingAddress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Miasto</Label>
            <Input
              id="city"
              placeholder="Warszawa"
              {...register('city')}
              disabled={isLoadingAddress}
            />
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
            {isLoading ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
