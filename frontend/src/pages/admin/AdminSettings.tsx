import { useState, useEffect } from 'react';
import { useGetSiteSettings, useSetSiteSettings, useWhatsappNumber, useSetWhatsappNumber } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, CreditCard, Store, Mail, Megaphone, Loader2, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSiteSettings();
  const setSiteSettings = useSetSiteSettings();
  const { data: whatsappNumberData, isLoading: whatsappLoading } = useWhatsappNumber();
  const setWhatsappNumber = useSetWhatsappNumber();

  const [storeName, setStoreName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [announcementBanner, setAnnouncementBanner] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [whatsappNumber, setWhatsappNumberState] = useState('');

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName ?? '');
      setContactEmail(settings.contactEmail ?? '');
      setAnnouncementBanner(settings.announcementBanner ?? '');
      setRazorpayKeyId(settings.razorpayKeyId ?? '');
    }
  }, [settings]);

  useEffect(() => {
    if (whatsappNumberData !== undefined) {
      setWhatsappNumberState(whatsappNumberData ?? '');
    }
  }, [whatsappNumberData]);

  const isLiveKey = razorpayKeyId.startsWith('rzp_live_');
  const isTestKey = razorpayKeyId.startsWith('rzp_test_');
  const isValidKey = isLiveKey || isTestKey;

  const handleSave = async () => {
    try {
      await setSiteSettings.mutateAsync({
        storeName,
        contactEmail,
        announcementBanner,
        razorpayKeyId,
        whatsappNumber: settings?.whatsappNumber ?? '',
      });
      toast.success('Settings saved successfully');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save settings');
    }
  };

  const handleSaveWhatsapp = async () => {
    try {
      await setWhatsappNumber.mutateAsync(whatsappNumber.trim());
      toast.success('WhatsApp number saved successfully');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save WhatsApp number');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your store configuration</p>
        </div>
      </div>

      {/* Store Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Store Information</CardTitle>
          </div>
          <CardDescription>Basic details about your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Nature Glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> Contact Email
              </span>
            </Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="hello@natureglow.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcementBanner">
              <span className="flex items-center gap-1">
                <Megaphone className="w-4 h-4" /> Announcement Banner
              </span>
            </Label>
            <Textarea
              id="announcementBanner"
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
              placeholder="Free shipping on orders above ₹499!"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">Leave empty to hide the banner.</p>
          </div>
        </CardContent>
      </Card>

      {/* Razorpay */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Razorpay Integration</CardTitle>
          </div>
          <CardDescription>Configure your Razorpay payment gateway</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="razorpayKeyId"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                placeholder="rzp_live_... or rzp_test_..."
                className="font-mono text-sm"
              />
              {razorpayKeyId && (
                isValidKey ? (
                  <Badge variant="default" className="shrink-0 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {isLiveKey ? 'Live' : 'Test'}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="shrink-0 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Invalid
                  </Badge>
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Your Razorpay Key ID starts with <code className="bg-muted px-1 rounded">rzp_live_</code> (production) or{' '}
              <code className="bg-muted px-1 rounded">rzp_test_</code> (testing).
            </p>
          </div>

          <Separator />

          <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">How to get your Razorpay Key ID:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Log in to your <a href="https://dashboard.razorpay.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Razorpay Dashboard</a></li>
              <li>Go to <strong>Settings → API Keys</strong></li>
              <li>Generate or copy your Key ID</li>
              <li>Paste it above and save</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Save Store + Razorpay Settings */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={setSiteSettings.isPending}
          className="min-w-[140px]"
        >
          {setSiteSettings.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>

      {/* WhatsApp */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            <CardTitle className="text-lg">WhatsApp Contact</CardTitle>
          </div>
          <CardDescription>
            Add your WhatsApp number to show a floating chat button on all customer-facing pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {whatsappLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number (with country code)</Label>
              <Input
                id="whatsappNumber"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumberState(e.target.value)}
                placeholder="e.g. 919876543210"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter the number in international format without <code className="bg-muted px-1 rounded">+</code> or spaces.
                Example: <code className="bg-muted px-1 rounded">919876543210</code> for an Indian number.
                Leave empty to hide the WhatsApp button.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSaveWhatsapp}
              disabled={setWhatsappNumber.isPending || whatsappLoading}
              variant="outline"
              className="min-w-[160px] border-green-600 text-green-700 hover:bg-green-50"
            >
              {setWhatsappNumber.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Save WhatsApp Number
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
