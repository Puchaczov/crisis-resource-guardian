import React from 'react';
import { ResourceCategory, ResourceStatus, ResourceFormData } from '@/types/resources';
import { resourceCategories, resourceStatuses } from '@/services/resourceService';
import { RESOURCE_CATEGORIES, RESOURCE_STATUSES } from '@/constants/resources';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ResourceFormFieldsProps {
  formData: ResourceFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  organization?: string;
  isOrganizationFixed?: boolean;
}

const ResourceFormFields: React.FC<ResourceFormFieldsProps> = ({
  formData,
  onInputChange,
  onLocationChange,
  onSelectChange,
  organization,
  isOrganizationFixed
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nazwa zasobu *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Kategoria *</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => onSelectChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Wybierz kategorię" />
            </SelectTrigger>
            <SelectContent>
              {resourceCategories
                .filter(cat => cat.value !== 'all')
                .map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
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
          onChange={onInputChange}
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
            onChange={onInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unit">Jednostka *</Label>
          <Input
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={onInputChange}
            required
            placeholder="szt, kg, l, m..."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => onSelectChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Wybierz status" />
            </SelectTrigger>
            <SelectContent>
              {resourceStatuses
                .filter(stat => stat.value !== 'all')
                .map((stat) => (
                  <SelectItem key={stat.value} value={stat.value}>
                    {stat.label}
                  </SelectItem>
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
            onChange={onLocationChange}
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
            onChange={onLocationChange}
            required
            placeholder="ul. Przykładowa 123, 00-000 Miasto"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization">Organizacja *</Label>
        <Input
          id="organization"
          name="organization"
          value={formData.organization}
          onChange={onInputChange}
          required
          disabled={isOrganizationFixed}
        />
        {organization && (
          <p className="text-xs text-muted-foreground">Organizacja jest ustawiona na podstawie Twojego konta</p>
        )}
      </div>
    </div>
  );
};

export default ResourceFormFields;
