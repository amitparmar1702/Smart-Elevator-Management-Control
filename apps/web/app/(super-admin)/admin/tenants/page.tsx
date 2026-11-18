'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TenantsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/organisations');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#EEF0F6] flex items-center justify-center text-xs text-[#5D6375] font-mono">
      Redirecting to Tenant Organisations...
    </div>
  );
}
