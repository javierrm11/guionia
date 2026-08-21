"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type CredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: CredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const iniciarGoogle = useCallback(() => {
    if (!CLIENT_ID || !contenedorRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response: CredentialResponse) => {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
        });

        if (signInError) {
          setError("No se pudo iniciar sesión con Google");
          return;
        }

        router.push("/contenido");
        router.refresh();
      },
    });

    window.google.accounts.id.renderButton(contenedorRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      width: String(contenedorRef.current.offsetWidth),
    });
  }, [router]);

  if (!CLIENT_ID) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={iniciarGoogle}
      />
      <div ref={contenedorRef} className="flex justify-center" />
      {error && <p className="text-small text-danger">{error}</p>}
    </>
  );
}
