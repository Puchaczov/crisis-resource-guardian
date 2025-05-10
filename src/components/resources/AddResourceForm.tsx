
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { resourceCategories, resourceStatuses, addResource } from '@/services/resourceService';
import { ResourceCategory, ResourceStatus } from '@/types/resources';
import { toast } from "@/components/ui/sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AddResourceForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const organization = user?.organization || '';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 1,
    unit: 'szt',
    category: '' as ResourceCategory | '',
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

    if (!formData.name || !formData.location.name || !formData.location.address) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Use the logged in user's organization or the selected one
      const resourceData = {
        ...formData,
        organization: formData.organization || organization,
        lastUpdated: new Date().toISOString()
      };
      
      const newResource = await addResource(resourceData);
      
      toast.success("Zasób został dodany pomyślnie");
      
      // Navigate to the resource details page
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa zasobu *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Kategoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceCategories.filter(cat => cat.value !== '').map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Ilość *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Jednostka *</Label>
                <Input
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                  placeholder="szt, kg, l, m..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value as ResourceStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Wybierz status" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceStatuses.filter(stat => stat.value !== '').map((stat) => (
                      <SelectItem key={stat.value} value={stat.value}>{stat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-md space-y-4">
              <h3 className="font-medium">Lokalizacja zasobu</h3>
              
              <div className="space-y-2">
                <Label htmlFor="location.name">Nazwa lokalizacji *</Label>
                <Input
                  id="location.name"
                  name="name"
                  value={formData.location.name}
                  onChange={handleLocationChange}
                  required
                  placeholder="np. Magazyn główny, Remiza OSP..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location.address">Adres *</Label>
                <Input
                  id="location.address"
                  name="address"
                  value={formData.location.address}
                  onChange={handleLocationChange}
                  required
                  placeholder="ul. Przykładowa 123, 00-000 Miasto"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location.coordinates.lat">Szerokość geograficzna</Label>
                  <Input
                    id="location.coordinates.lat"
                    type="number"
                    step="0.000001"
                    value={formData.location.coordinates.lat}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        coordinates: {
                          ...formData.location.coordinates,
                          lat: parseFloat(e.target.value)
                        }
                      }
                    })}
                    placeholder="52.2297"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location.coordinates.lng">Długość geograficzna</Label>
                  <Input
                    id="location.coordinates.lng"
                    type="number"
                    step="0.000001"
                    value={formData.location.coordinates.lng}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        coordinates: {
                          ...formData.location.coordinates,
                          lng: parseFloat(e.target.value)
                        }
                      }
                    })}
                    placeholder="21.0122"
                  />
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Współrzędne geograficzne zostaną automatycznie uzupełnione na podstawie adresu w wersji produkcyjnej.</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organization">Organizacja *</Label>
              <Input
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                required
                disabled={!!organization}
              />
              {organization && (
                <p className="text-xs text-muted-foreground">Organizacja jest ustawiona na podstawie Twojego konta</p>
              )}
            </div>
          </div>
          
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
