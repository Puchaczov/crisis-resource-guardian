import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { addResource } from '@/services/resourceService';
import { ResourceCategory, ResourceStatus, ResourceFormData } from '@/types/resources';
import { toast } from "@/components/ui/sonner";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResourceFormFields from './ResourceFormFields';
import { RESOURCE_CATEGORIES, RESOURCE_STATUSES } from '@/constants/resources';

const AddResourceForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const organization = user?.organization || '';

  const [formData, setFormData] = useState<ResourceFormData>({
    name: '',
    description: '',
    quantity: 1,
    unit: 'szt',
    category: '',
    status: 'available' as ResourceStatus,
    organization: organization,
    location: {
      name: '',
      address: '',
      coordinates: {
        lat: 52.2297,
        lng: 21.0122
      }
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast.error("Wybierz kategorię zasobu");
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.location.name || !formData.location.address) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    // Update category validation
    if (!Object.values(RESOURCE_CATEGORIES).includes(formData.category as ResourceCategory)) {
      toast.error("Nieprawidłowa kategoria zasobu");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const resourceData = {
        ...formData,
        organization: formData.organization || organization,
        lastUpdated: new Date().toISOString(),
        category: formData.category as ResourceCategory,
        status: formData.status as ResourceStatus,
        quantity: Number(formData.quantity) || 0
      };
      
      await addResource(resourceData);
      
      toast.success("Zasób został dodany pomyślnie");
      
      navigate('/resources');
    } catch (error) {
      console.error("Error adding resource:", error);
      toast.error("Wystąpił błąd podczas dodawania zasobu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Dodaj nowy zasób</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ResourceFormFields
            formData={formData}
            onInputChange={handleInputChange}
            onLocationChange={handleLocationChange}
            onSelectChange={handleSelectChange}
            organization={organization}
            isOrganizationFixed={!!organization}
          />
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="outline" type="button" onClick={() => navigate('/resources')}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Dodawanie..." : "Dodaj zasób"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddResourceForm;
