import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type MainState = {
    shopifyShopId: string | undefined;
    setShopifyShopId: (val: string | undefined) => void;
    clearShopifyContext: () => void;
};

export const useMainStore = create<MainState>()(
    persist(
        (set) => ({
            shopifyShopId: "",
            setShopifyShopId: (val: string | undefined) => set(() => ({ shopifyShopId: val })),
            clearShopifyContext: () => set(() => ({ shopifyShopId: "" })),
        }),
        {
            name: "shopsee-shopify-context",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
