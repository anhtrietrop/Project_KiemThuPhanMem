"use client";
import { useState } from "react";
import { Info } from "lucide-react";

interface ValidationTooltipProps {
    rules: string[];
}

export const ValidationTooltip = ({ rules }: ValidationTooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="relative inline-block ml-1">
            <button
                type="button"
                className="text-gray-400 hover:text-blue-500 focus:outline-none"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                aria-label="Validation rules"
            >
                <Info size={16} />
            </button>

            {isVisible && (
                <div className="absolute z-50 left-6 top-0 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
                    <div className="font-semibold mb-2">Validation Rules:</div>
                    <ul className="list-disc list-inside space-y-1">
                        {rules.map((rule, index) => (
                            <li key={index}>{rule}</li>
                        ))}
                    </ul>
                    <div className="absolute left-0 top-2 -ml-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800" />
                </div>
            )}
        </div>
    );
};

// Validation rules for each field
export const VALIDATION_RULES = {
    name: [
        "Minimum 2 characters",
        "Maximum 50 characters",
        "Only letters, spaces, hyphens, dots allowed",
        "Vietnamese characters supported",
        "No special characters (@, #, $, %, etc.)"
    ],
    lastname: [
        "Minimum 2 characters",
        "Maximum 50 characters",
        "Only letters, spaces, hyphens, dots allowed",
        "Vietnamese characters supported"
    ],
    email: [
        "Valid email format required",
        "Example: user@example.com",
        "Maximum 254 characters"
    ],
    phone: [
        "Minimum 10 digits",
        "Maximum 20 characters",
        "Can include +, -, (, ), spaces"
    ],
    address: [
        "Minimum 5 characters",
        "Maximum 200 characters",
        "No script tags or HTML allowed"
    ],
    city: [
        "Minimum 5 characters",
        "Maximum 200 characters",
        "Letters, numbers, spaces allowed"
    ],
    apartment: [
        "Optional field",
        "Maximum 200 characters"
    ]
};

export default ValidationTooltip;
