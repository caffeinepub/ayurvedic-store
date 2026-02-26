import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { ProductInput, OrderInput, SiteSettings, UserProfile, ShoppingItem, StripeConfiguration } from '../backend';

// ── Admin ────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';
  const isLoginSuccess = loginStatus === 'success';

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !isLoggingIn && !isLoginSuccess,
    retry: false,
  });
}

export function useSetAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      await actor.setAdmin(Principal.fromText(principal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
    },
  });
}

// ── Products ─────────────────────────────────────────────────────────────────

export function useGetProducts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllProducts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFeaturedProducts() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductById(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['product', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProductById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productInput: ProductInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(productInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productInput }: { id: bigint; productInput: ProductInput }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(id, productInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useGetOrders() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['myOrders', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderInput: OrderInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(orderInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
}

export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, paymentId }: { orderId: bigint; paymentId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmPayment(orderId, paymentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
}

export function useUpdateFulfillmentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFulfillmentStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Site Settings ─────────────────────────────────────────────────────────────

export function useGetSiteSettings() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSiteSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetSiteSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setSiteSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      queryClient.invalidateQueries({ queryKey: ['razorpayKeyId'] });
    },
  });
}

export function useGetRazorpayKeyId() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['razorpayKeyId'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getRazorpayKeyId();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

export function useWhatsappNumber() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['whatsappNumber'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWhatsappNumber();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
  });
}

export function useSetWhatsappNumber() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (number: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setWhatsappNumber(number);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsappNumber'] });
    },
  });
}

// ── Stripe ────────────────────────────────────────────────────────────────────

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
      if (!actor) throw new Error('Actor not available');
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      return session;
    },
  });
}
