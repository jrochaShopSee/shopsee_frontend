import { SignUpInfoResponse } from "./getSignUpInfoProps";
import { SubscriptionModel } from "./ShopseeSubscriptionProps";

export interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

export interface SubscriptionModalProps extends ModalProps {
  plans: SubscriptionModel[];
  data: SignUpInfoResponse;
  subscriptionId: number;
  setSubscriptionId: (id: number) => void;
  isAnnual: boolean;
  isFromShopify?: boolean;
}
