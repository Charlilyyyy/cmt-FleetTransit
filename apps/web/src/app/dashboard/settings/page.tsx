'use client';

import { PageHeader } from '@/components/dashboard/ResourceTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { claims } = useAuth();

  return (
    <div>
      <PageHeader title="Settings" description="Organization and account configuration." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Role:</span> {claims?.role ?? '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Organization:</span>{' '}
              {claims?.organizationId ?? '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Guardian alert channels (LINE, Telegram, FCM) are configured per organization. See the
            notifications documentation.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
