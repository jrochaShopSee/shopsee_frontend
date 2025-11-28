import React, { useEffect, useState } from "react";
import { PricingCardProps } from "../types/PricingCardProps";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Check } from "lucide-react";

const PricingCard: React.FC<PricingCardProps> = ({ title, price, features, planId, selected, buttonText, chooseSubscription, isMostPopular }) => {
    const defaultText = "Choose Plan";
    const [descriptions, setDescriptions] = useState<string[]>([]);
    const [btnText, setBtnText] = useState(defaultText);

    useEffect(() => {
        const listOfStrings = features.split("\\n").map((item) => item.trim());
        setDescriptions(listOfStrings);
    }, [features]);

    useEffect(() => {
        if (buttonText) {
            setBtnText(buttonText);
        } else {
            setBtnText(defaultText);
        }
    }, [buttonText]);

    return (
        <Card
            variant="elevated"
            hoverable
            className={`flex flex-col h-full ${isMostPopular ? "border-2 border-success ring-2 ring-success/20" : selected ? "border-2 border-primary ring-2 ring-primary/20" : "border border-gray-200"}`}
        >
            <CardHeader className="text-center pb-8">
                {isMostPopular && (
                    <div className="mb-4">
                        <span className="px-4 py-1 bg-success text-white text-xs font-semibold rounded-full">
                            Most Popular
                        </span>
                    </div>
                )}
                <CardTitle className="text-2xl mb-4">{title}</CardTitle>
                <div className="mt-4">
                    <span className="text-5xl font-bold text-gray-900">${price}</span>
                    <span className="text-gray-600 text-lg ml-2">/month</span>
                </div>
            </CardHeader>

            <CardContent className="flex-grow">
                <ul className="space-y-4">
                    {descriptions.map((description, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                            <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                            <span className="text-base leading-relaxed">{description}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter className="pt-6">
                <Button
                    type="button"
                    onClick={() => chooseSubscription(planId)}
                    variant={selected ? "success" : "default"}
                    size="lg"
                    className="w-full"
                >
                    {btnText}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default PricingCard;
