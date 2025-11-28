export interface PricingCardProps {
  title: string;
  price: string;
  features: string;
  planId: number;
  chooseSubscription: (id: number) => void;
  selected?: boolean;
  buttonText?: string;
  isMostPopular?: boolean;
}
