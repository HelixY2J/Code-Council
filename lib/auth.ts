import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { polarClient } from "@/modules/payment/config/polar";
import { updatePolarCustomerId, updateUserTier } from "@/modules/payment/lib/subscription";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysq..etc
    }),
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            scope: ["repo"]
        }
    },

    trustedOrigins: ["http://localhost:3002", "https://6bac-2405-201-a40c-d009-100b-4b16-a67d-986b.ngrok-free.app"],
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    // Configure products that can be purchased
                    // The slug is used when calling checkout({ slug: "Pro" })
                    products: [
                        {
                            productId: "500d00ba-f6bf-43b9-8cb3-b492aa9b5842",
                            slug: "Pro"
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL || "/dashboard/subscription?success=true",
                    authenticatedUsersOnly: true
                }),
                portal({
                    returnUrl: process.env.POLAR_RETURN_URL || "http://localhost:3002/dashbaord",
                }),
                usage(),
                webhooks({
                    secret: process.env.POLAR_WEBHOOK_SERCRET!,
                    onSubscriptionActive: async (payload) => {
                        const customerid = payload.data.customerId;
                        const user = await prisma.user.findUnique({
                            where: {
                                polarCustomerID: customerid
                            }
                        });
                        if (user) {
                            await updateUserTier(user.id, "PRO", "ACTIVE", payload.data.id)
                        }
                    },
                    onSubscriptionCanceled: async (payload) => {
                        const customerid = payload.data.customerId;
                        const user = await prisma.user.findUnique({
                            where: {
                                polarCustomerID: customerid
                            }
                        });
                        if (user) {
                            await updateUserTier(user.id, user.subscriptionTier as any, "CANCELED")
                        }
                    },
                    onSubscriptionRevoked: async (payload) => {
                        const customerid = payload.data.customerId;
                        const user = await prisma.user.findUnique({
                            where: {
                                polarCustomerID: customerid
                            }
                        });
                        if (user) {
                            await updateUserTier(user.id, "FREE", "EXPIRED")
                        }
                    },
                    onOrderPaid: async () => { }, // later
                    onCustomerCreated: async (payload) => {
                        const user = await prisma.user.findUnique({
                            where: {
                                email: payload.data.email
                            }
                        });
                        if (user) {
                            await updatePolarCustomerId(user.id, payload.data.id)
                        }
                    },

                })
            ],
        })
    ]
});