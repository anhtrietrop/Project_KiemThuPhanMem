import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// To extend the built-in session and user types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"]; // Keep the default properties
    }

    interface User extends DefaultUser {
        role: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        role: string;
    }
}

declare global {
    interface Product {
        id: string;
        title: string;
        description: string;
        price: number;
        costPrice?: number;
        quantity: number;
        inStock: boolean;
        mainImage?: string;
        manufacturer?: string;
        rating?: number;
    }
}
