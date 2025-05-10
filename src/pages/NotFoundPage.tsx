
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
      <div className="text-emergency mb-4">
        <AlertTriangle size={64} />
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Strona nie została znaleziona</p>
      <Button asChild>
        <Link to="/">Wróć do strony głównej</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;
