import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground animate-pulse">Carregando loja...</p>
    </div>
  );
}