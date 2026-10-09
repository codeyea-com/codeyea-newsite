import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { HomepageHeroMotionPrototype } from '@/components/prototype/homepage-hero-motion-prototype';
import { auth } from '@/server/auth';
import { requirePermission } from '@/server/permissions';
import '@/styles/homepage-hero-motion-prototype.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Homepage 3D motion prototype · CODEYEA',
  robots: { index: false, follow: false },
};

export default async function HeroMotionPrototypePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/login');
  await requirePermission(session.user.id, 'view_admin');

  return <HomepageHeroMotionPrototype />;
}
