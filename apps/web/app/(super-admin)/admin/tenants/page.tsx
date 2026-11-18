'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TenantsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/organisations');
  }, [router]);

  return null;
}
