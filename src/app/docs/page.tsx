'use client';

import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Spec = Record<string, any> & {
  // Add other properties as needed
};

export default function DocsPage() {
  const [spec, setSpec] = useState<Spec | null>(null);

  useEffect(() => {
    // Only run this on the client-side, and in development
    if (process.env.NODE_ENV === 'development') {
      fetch('/api/swagger')
        .then(response => response.json())
        .then(data => {
          setSpec(data);
        });
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">API documentation is only available in development mode.</p>
      </div>
    );
  }

  return (
    <section>
        {spec ? (
            <SwaggerUI spec={spec} />
        ) : (
            <div className="flex h-screen items-center justify-center">
                <p className="text-lg text-muted-foreground">Loading API documentation...</p>
            </div>
        )}
    </section>
  );
}
