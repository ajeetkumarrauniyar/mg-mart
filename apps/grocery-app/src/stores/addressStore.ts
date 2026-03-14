import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedAddress {
    id: string;
    label: 'Home' | 'Work' | 'Other';
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
}

interface AddressState {
    addresses: SavedAddress[];
    addAddress: (address: Omit<SavedAddress, 'id'>) => void;
    removeAddress: (id: string) => void;
    updateAddress: (id: string, address: Partial<SavedAddress>) => void;
    setDefaultAddress: (id: string) => void;
}

export const useAddressStore = create<AddressState>()(
    persist(
        (set) => ({
            addresses: [
                {
                    id: '1',
                    label: 'Home',
                    street: '123, Sunny Apartments, Sector 45',
                    city: 'Gurugram',
                    state: 'Haryana',
                    zipCode: '122003',
                    isDefault: true,
                },
                {
                    id: '2',
                    label: 'Work',
                    street: 'Cyber Hub, Building 10C, 5th Floor',
                    city: 'Gurugram',
                    state: 'Haryana',
                    zipCode: '122002',
                    isDefault: false,
                }
            ],
            addAddress: (address) => set((state) => ({
                addresses: [...state.addresses, { ...address, id: Math.random().toString() }]
            })),
            removeAddress: (id) => set((state) => ({
                addresses: state.addresses.filter(a => a.id !== id)
            })),
            updateAddress: (id, updated) => set((state) => ({
                addresses: state.addresses.map(a => a.id === id ? { ...a, ...updated } : a)
            })),
            setDefaultAddress: (id) => set((state) => ({
                addresses: state.addresses.map(a => ({ ...a, isDefault: a.id === id }))
            })),
        }),
        {
            name: 'address-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
