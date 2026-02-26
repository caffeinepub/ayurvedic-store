import React, { useState, useEffect } from 'react';
import { useGetSiteSettings, useSetSiteSettings } from '../../hooks/useQueries';
import { Settings, Key, Save, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSiteSettings();
  const setSiteSettings = useSetSiteSettings();

  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings) {
      setRazorpayKeyId(settings.razorpayKeyId);
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    try {
      await setSiteSettings.mutateAsync({ razorpayKeyId: razorpayKeyId.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-admin-fg">Site Settings</h1>
        <p className="text-sm text-admin-muted mt-0.5">Configure your store settings and integrations</p>
      </div>

      {/* Razorpay Settings */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-admin-accent/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-admin-accent" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-admin-fg">Razorpay Integration</CardTitle>
              <CardDescription className="text-admin-muted text-sm">
                Configure your Razorpay payment gateway credentials
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-admin-accent" />
              <span className="text-sm text-admin-muted">Loading settings…</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="razorpayKeyId" className="text-admin-fg font-medium">
                  Razorpay Key ID
                </Label>
                <Input
                  id="razorpayKeyId"
                  value={razorpayKeyId}
                  onChange={e => setRazorpayKeyId(e.target.value)}
                  placeholder="rzp_live_xxxxxxxxxxxx or rzp_test_xxxxxxxxxxxx"
                  className="bg-admin-bg border-admin-border text-admin-fg placeholder:text-admin-muted font-mono"
                />
                <p className="text-xs text-admin-muted">
                  This is your public Razorpay Key ID (starts with <code className="bg-admin-bg px-1 py-0.5 rounded text-admin-fg">rzp_</code>).
                  Find it in your{' '}
                  <a
                    href="https://dashboard.razorpay.com/app/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-admin-accent hover:underline inline-flex items-center gap-0.5"
                  >
                    Razorpay Dashboard
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              {/* Key type indicator */}
              {razorpayKeyId && (
                <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
                  razorpayKeyId.startsWith('rzp_live_')
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : razorpayKeyId.startsWith('rzp_test_')
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-admin-bg border-admin-border text-admin-muted'
                }`}>
                  {razorpayKeyId.startsWith('rzp_live_') ? (
                    <><CheckCircle2 className="w-3.5 h-3.5" /> Live mode key detected</>
                  ) : razorpayKeyId.startsWith('rzp_test_') ? (
                    <><AlertCircle className="w-3.5 h-3.5" /> Test mode key — switch to live key for production</>
                  ) : (
                    <><AlertCircle className="w-3.5 h-3.5" /> Key format not recognized</>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {saved && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Settings saved successfully!
                </div>
              )}

              <Button
                type="submit"
                disabled={setSiteSettings.isPending}
                className="bg-admin-accent hover:bg-admin-accent/90 text-white"
              >
                {setSiteSettings.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Save Settings</>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-admin-accent/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-admin-accent" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-admin-fg">About Settings</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-admin-muted">
            <li className="flex items-start gap-2">
              <span className="text-admin-accent mt-0.5">•</span>
              The Razorpay Key ID is stored securely on the blockchain and used by the checkout page.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-admin-accent mt-0.5">•</span>
              Use a <strong className="text-admin-fg">test key</strong> (<code className="bg-admin-bg px-1 rounded">rzp_test_</code>) during development and a <strong className="text-admin-fg">live key</strong> (<code className="bg-admin-bg px-1 rounded">rzp_live_</code>) for production.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-admin-accent mt-0.5">•</span>
              Changes take effect immediately for all new checkout sessions.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
