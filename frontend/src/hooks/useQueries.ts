import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Product,
  ProductInput,
  Order,
  OrderInput,
  UserProfile,
  SiteSettings,
  WhatsAppButtonSettings,
  ShoppingItem,
  StripeConfiguration,
} from '../backend';
import { ProductStatus } from '../backend';

// ── Admin status ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        try {
          return await actor.isAdmin();
        } catch {
          return false;
        }
      }
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    staleTime: 30_000,
  });
}

// ── User profile ─────────────────────────────────────────────────────────────

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

// ── Products ─────────────────────────────────────────────────────────────────

export function useGetProducts(statusFilter: ProductStatus[] = []) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', statusFilter],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts(statusFilter);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['allProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetFeaturedProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetProductById(id: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getProductById(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
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
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
    },
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useGetOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetMyOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !actorFetching,
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
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, razorpayPaymentId }: { orderId: bigint; razorpayPaymentId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmPayment(orderId, razorpayPaymentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
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
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
}

// ── Site settings ─────────────────────────────────────────────────────────────

export function useGetSiteSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SiteSettings>({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSiteSettings();
    },
    enabled: !!actor && !actorFetching,
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
    },
  });
}

export function useGetRazorpayKeyId() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['razorpayKeyId'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getRazorpayKeyId();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

export function useWhatsappNumber() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['whatsappNumber'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWhatsappNumber();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
  });
}

// Alias for backward compatibility
export const useGetWhatsappNumber = useWhatsappNumber;

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
      queryClient.invalidateQueries({ queryKey: ['whatsappButtonSettings'] });
    },
  });
}

export function useGetWhatsappButtonSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WhatsAppButtonSettings>({
    queryKey: ['whatsappButtonSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWhatsappButtonSettings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateWhatsappButtonSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: WhatsAppButtonSettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWhatsappButtonSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsappButtonSettings'] });
    },
  });
}

// ── Users (admin) ─────────────────────────────────────────────────────────────

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Stripe ────────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
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

export type CheckoutSession = {
  id: string;
  url: string;
};

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
