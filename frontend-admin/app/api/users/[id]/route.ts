import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { Session } from "next-auth";

// GET single user
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions) as Session | null;

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}

// PUT update user (block/unblock, change role)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions) as Session | null;

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { role, status } = body;

        // Prevent admin from modifying their own account
        if (id === session.user?.id) {
            return NextResponse.json(
                { error: "Cannot modify your own account" },
                { status: 400 }
            );
        }

        const updateData: Record<string, string> = {};

        if (role !== undefined) {
            updateData.role = role;
        }

        if (status !== undefined) {
            updateData.status = status; // 'active', 'blocked'
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                role: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}

// DELETE user
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions) as Session | null;

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Prevent admin from deleting their own account
        if (id === session.user?.id) {
            return NextResponse.json(
                { error: "Cannot delete your own account" },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Delete user (cascade will handle related records)
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}
