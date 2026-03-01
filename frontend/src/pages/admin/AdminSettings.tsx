import { useState, useEffect } from 'react';
import {
  useGetSiteSettings,
  useSetSiteSettings,
  useWhatsappNumber,
  useSetWhatsappNumber,
} from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Settings,
  CreditCard,
  Store,
  Mail,
  Megaphone,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSiteSettings();
  const setSiteSettings = useSetSiteSettings();
  const { data: whatsappNumberData } = useWhatsappNumber();
  const setWhatsappNumber = useSetWhatsappNumber();
  const queryClient = useQueryClient();

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
      await queryClient.invalidateQueries({ queryKey: ['whatsappNumber'] });
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
        <div className="p-2 rounded-lg bg-admin-accent/10">
          <Settings className="w-6 h-6 text-admin-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-admin-fg">Settings</h1>
          <p className="text-sm text-admin-muted">Manage your store configuration</p>
        </div>
      </div>

      {/* Store Info */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-admin-accent" />
            <CardTitle className="text-admin-fg text-base">Store Information</CardTitle>
          </div>
          <CardDescription className="text-admin-muted">
            Basic details about your store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-admin-fg">Store Name</Label>
            <Input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Nature Glow"
              className="bg-admin-bg border-admin-border text-admin-fg"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-admin-fg flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Contact Email
            </Label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="hello@natureglow.com"
              className="bg-admin-bg border-admin-border text-admin-fg"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-admin-fg flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Announcement Banner
            </Label>
            <Textarea
              value={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.value)}
              placeholder="Free shipping on orders above ₹499!"
              rows={2}
              className="bg-admin-bg border-admin-border text-admin-fg resize-none"
            />
            <p className="text-admin-muted text-xs">
              Leave empty to hide the announcement banner.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Razorpay */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-admin-accent" />
            <CardTitle className="text-admin-fg text-base">Payment Gateway</CardTitle>
          </div>
          <CardDescription className="text-admin-muted">
            Configure Razorpay for accepting payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-admin-fg">Razorpay Key ID</Label>
            <div className="relative">
              <Input
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                placeholder="rzp_live_... or rzp_test_..."
                className="bg-admin-bg border-admin-border text-admin-fg pr-24"
              />
              {razorpayKeyId && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {isValidKey ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                      {isLiveKey ? 'Live' : 'Test'}
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 border-0 text-xs">Invalid</Badge>
                  )}
                </div>
              )}
            </div>
            {razorpayKeyId && !isValidKey && (
              <div className="flex items-center gap-2 text-red-500 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                Key must start with rzp_live_ or rzp_test_
              </div>
            )}
            {isLiveKey && (
              <div className="flex items-center gap-2 text-amber-600 text-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                You are using a live key — real payments will be processed.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card className="bg-admin-card border-admin-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-admin-accent" />
            <CardTitle className="text-admin-fg text-base">WhatsApp Support</CardTitle>
          </div>
          <CardDescription className="text-admin-muted">
            Configure the WhatsApp floating button
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-admin-fg">WhatsApp Number</Label>
            <Input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumberState(e.target.value)}
              placeholder="+91 98765 43210"
              className="bg-admin-bg border-admin-border text-admin-fg"
            />
            <p className="text-admin-muted text-xs">
              Include country code (e.g. +91 for India)
            </p>
          </div>
          <Button
            onClick={handleSaveWhatsapp}
            disabled={setWhatsappNumber.isPending}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {setWhatsappNumber.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5 mr-2" />
                Save WhatsApp Number
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Separator className="bg-admin-border" />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={setSiteSettings.isPending}
          className="bg-admin-accent hover:bg-admin-accent/90 text-white px-8"
        >
          {setSiteSettings.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
