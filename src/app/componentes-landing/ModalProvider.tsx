"use client"
import React, { createContext, useContext, useState } from "react";

interface ModalContextType {
    openModal: (planName: string, price: string, duration: string) => void;
    closeModal: () => void;
    isOpen: boolean;
    planData: { name: string; price: string; duration: string } | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [planData, setPlanData] = useState<{ name: string; price: string; duration: string } | null>(null);

    const openModal = (name: string, price: string, duration: string) => {
        setPlanData({ name, price, duration });
        setIsOpen(true);
    };

    const closeModal = () => setIsOpen(false);

    return (
        <ModalContext.Provider value={{ isOpen, planData, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
}

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error("useModal must be used within ModalProvider");
    return context;
};
