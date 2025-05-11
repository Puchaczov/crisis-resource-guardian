import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getResourceById, updateResource } from '@/services/resourceService';
import { Resource, ResourceStatus, ResourceCategory, ResourceFormData } from '@/types/resources';
import { RESOURCE_CATEGORIES, RESOURCE_STATUSES } from '@/constants/resources';
import { toast } from "@/components/ui/sonner";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResourceFormFields from './ResourceFormFields';

interface EditFormData extends ResourceFormData {
  id: string;
  lastUpdated: string;
}

const EditResourceForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<EditFormData>({
    id: '',
    name: '',
    description: '',
    quantity: 1,
    unit: 'szt',
    category: '',
    status: 'available' as ResourceStatus,
    organization: user?.organization || '',
    location: {
      name: '',
      address: '',
      coordinates: {
        lat: 52.2297,
        lng: 21.0122
      }
    },
    lastUpdated: ''
  });

  useEffect(() => {
    const loadResource = async () => {
      try {
        if (!id) return;
        const resource = await getResourceById(id);
        if (resource) {
          setFormData(resource);
        } else {
          toast.error("Nie znaleziono zasobu");
          navigate('/resources');
        }
      } catch (error) {
        console.error("Error loading resource:", error);
        toast.error("Błąd podczas ładowania zasobu");
      } finally {
        setIsLoading(false);
      }
    };

    loadResource();
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        [name]: value
      }
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: name === 'status' ? value : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error("Wybierz kategorię zasobu");
      return;
    }

    if (!formData.name || !formData.location.name || !formData.location.address) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    // Update category and status validation
    if (!Object.values(RESOURCE_CATEGORIES).includes(formData.category as ResourceCategory)) {
      toast.error("Nieprawidłowa kategoria zasobu");
      return;
    }

    if (!Object.values(RESOURCE_STATUSES).includes(formData.status as ResourceStatus)) {
      toast.error("Nieprawidłowy status zasobu");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateResource({
        ...formData,
        category: formData.category as ResourceCategory,
        status: formData.status as ResourceStatus,
        quantity: Number(formData.quantity) || 0
      });
      toast.success("Zasób został zaktualizowany");
      navigate('/resources');
    } catch (error) {
      console.error("Error updating resource:", error);
      toast.error("Wystąpił błąd podczas aktualizacji zasobu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edytuj zasób</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ResourceFormFields
            formData={formData}
            onInputChange={handleInputChange}
            onLocationChange={handleLocationChange}
            onSelectChange={handleSelectChange}
            organization={user?.organization}
            isOrganizationFixed={!!user?.organization}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/resources')}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditResourceForm;