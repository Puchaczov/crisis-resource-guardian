
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await login(email, password, organization);
    } catch (err) {
      setError("Niepoprawne dane logowania. Spróbuj ponownie.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-navy">Zaloguj się</CardTitle>
        <CardDescription className="text-center">
          Wprowadź dane, aby uzyskać dostęp do systemu zarządzania zasobami
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization">Organizacja</Label>
            <Select value={organization} onValueChange={setOrganization}>
              <SelectTrigger id="organization">
                <SelectValue placeholder="Wybierz organizację" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Główny Urząd">Główny Urząd</SelectItem>
                <SelectItem value="Straż Pożarna">Straż Pożarna</SelectItem>
                <SelectItem value="Czerwony Krzyż">Czerwony Krzyż</SelectItem>
                <SelectItem value="Urząd Miasta">Urząd Miasta</SelectItem>
                <SelectItem value="Policja">Policja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twój.email@organizacja.pl"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Hasło</Label>
              <a href="#" className="text-sm text-primary hover:underline">
                Zapomniałeś hasła?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-emergency text-sm">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-navy hover:bg-navy-light"
            disabled={isLoading}
          >
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>
          
          <div className="text-xs text-center text-muted-foreground mt-4">
            <p>
              Demo: użyj przykładowych kont:<br/>
              <span className="font-semibold">admin@demo.pl</span>,{" "}
              <span className="font-semibold">reporter@demo.pl</span>,{" "}
              <span className="font-semibold">coordinator@demo.pl</span> lub{" "}
              <span className="font-semibold">viewer@demo.pl</span>
              <br />
              z dowolnym hasłem i organizacją
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
