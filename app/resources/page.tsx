import React from "react";
import { getResources } from "@/lib/data";
import { ResourcesClient } from "@/components/resources/ResourcesClient";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Data Vault — REY Community",
  description: "Access community resources, textures, blueprints, and classified assets for digital architects.",
};

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "spectator";
  const resources = await getResources(userRole);

  return <ResourcesClient initialResources={resources} />;
}
