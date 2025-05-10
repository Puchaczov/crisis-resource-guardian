import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import emergencyData from "@/pages/emergency_instructions.json";

interface ResourceAvailability {
  resource_name: string;
  available: number;
  required: number;
}

const mockFetchResourceAvailability = async (resources: any[]): Promise<ResourceAvailability[]> => {
  return resources.map((resource) => ({
    resource_name: resource.resource_name,
    available: Math.floor(Math.random() * (resource.quantity_needed + 10)),
    required: resource.quantity_needed,
  }));
};

const EmergencyResponsePlanner: React.FC = () => {
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [resourceAvailability, setResourceAvailability] = useState<ResourceAvailability[]>([]);
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [nlpPipeline, setNlpPipeline] = useState<any>(null);

  useEffect(() => {
    if (selectedEmergency) {
      const emergency = emergencyData.emergencies.find(
        (e) => e.emergency_type === selectedEmergency
      );
      if (emergency) {
        setActions(emergency.emergency_actions);

        const allResources = emergency.emergency_actions.flatMap(
          (action) => action.resources_required || []
        );
        mockFetchResourceAvailability(allResources).then(setResourceAvailability);
      }
    }
  }, [selectedEmergency]);

  const handleSearch = async () => {
    if (!nlpPipeline) {
      alert("Model is still loading. Please wait.");
      return;
    }

    // Extract embeddings for the user query
    const queryEmbedding = await nlpPipeline(searchQuery);

    // Compare query embeddings with emergency action descriptions
    const results = emergencyData.emergencies.flatMap((emergency) => {
      const actionMatches = emergency.emergency_actions.filter(async (action) => {
        const actionEmbedding = await nlpPipeline(action.name);
        const similarity = cosineSimilarity(queryEmbedding[0], actionEmbedding[0]);
        return similarity > 0.7; // Adjust threshold as needed
      });

      return actionMatches.length > 0
        ? { ...emergency, emergency_actions: actionMatches }
        : null;
    }).filter(Boolean);

    setSearchResults(results);
  };

  const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  };

  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Planer Reagowania Kryzysowego</h1>
      {/* Emergency Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Wybierz sytuację kryzysową</label>
        <Select onValueChange={setSelectedEmergency}>
          <SelectTrigger>
            <SelectValue placeholder="-" />
          </SelectTrigger>
          <SelectContent>
            {emergencyData.emergencies.map((emergency) => (
              <SelectItem key={emergency.emergency_type} value={emergency.emergency_type}>
                {emergency.emergency_type_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actionable List */}
      {actions.length > 0 && (
        <div className="space-y-4">
          {actions.map((action, actionIndex) => (
            <Card key={action.action_id}>
              <CardHeader>
                <CardTitle>
                  {actionIndex + 1}. {action.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-700">{action.instructions.description}</p>

                {/* Legal Reference */}
                {action.instructions.legal_reference && action.instructions.legal_reference_name && (
                  <p className="text-sm">
                    <a
                      href={action.instructions.legal_reference}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {action.instructions.legal_reference_name}
                    </a>
                  </p>
                )}

                {/* Subactions with Checkboxes */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-800">Podzadania:</h3>
                  <ul className="list-none space-y-3">
                    {action.instructions.details.map((detail: string, index: number) => {
                      const stepId = `${action.action_id}-detail-${index}`;
                      return (
                        <li key={stepId} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id={stepId}
                            checked={!!completedSteps[stepId]}
                            onChange={() => toggleStepCompletion(stepId)}
                            className="h-5 w-5 rounded border-gray-300"
                          />
                          <label htmlFor={stepId} className="text-sm text-gray-700">
                            {detail}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Verification Criteria with Checkboxes */}
                {action.verification?.criteria && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-800">Kryteria weryfikacji:</h3>
                    <ul className="list-none space-y-3">
                      {action.verification.criteria.map((criterion: string, index: number) => {
                        const criterionId = `${action.action_id}-verification-${index}`;
                        return (
                          <li key={criterionId} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={criterionId}
                              checked={!!completedSteps[criterionId]}
                              onChange={() => toggleStepCompletion(criterionId)}
                              className="h-5 w-5 rounded border-gray-300"
                            />
                            <label htmlFor={criterionId} className="text-sm text-gray-700">
                              {criterion}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Resources Required */}
                {action.resources_required && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-md shadow-sm">
                    <h3 className="text-base font-semibold text-gray-800">Wymagane zasoby:</h3>
                    <ul className="list-disc pl-6 space-y-3">
                      {action.resources_required.map((resource: any, index: number) => {
                        const availability = resourceAvailability.find(
                          (r) => r.resource_name === resource.resource_name
                        );
                        const isAvailable =
                          availability && availability.available >= resource.quantity_needed;

                        return (
                          <li key={index} className="flex items-center space-x-4">
                            <span className="font-medium text-gray-800">{resource.resource_name}</span>
                            <span className="text-gray-600">
                              - Wymagane: {resource.quantity_needed}, Dostępne:
                            </span>
                            <Badge
                              variant={isAvailable ? "default" : "destructive"}
                              className={`${
                                isAvailable ? "bg-green-500 text-white" : "bg-red-500 text-white"
                              } px-2 py-1 rounded-md`}
                            >
                              {availability ? availability.available : "Ładowanie..."}
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyResponsePlanner;