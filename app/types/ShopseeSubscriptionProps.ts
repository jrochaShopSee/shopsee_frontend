export interface SubscriptionPlan {
  subscriptions: SubscriptionModel[];
}

export interface SubscriptionModel {
  id: number;
  subscriptionName: string;
  subscriptionDescription: string;
  price: number;
  priceAnnually: number;
  annualDiscount: number;
  videosPerMonth: number;
  maxLength: number;
  maxProducts: number;
  revenueSplit: number;
  analytics: boolean;
  onlineSupport: boolean;
  isMostPopular: boolean;
  isActive: boolean;
}
