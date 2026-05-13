import React from "react";
import { getProjects } from "@/lib/data";
import { ProjectsClient } from "@/components/projects/ProjectsClient";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const metadata: Metadata = {
  title: "Build Repository — REY Community",
  description: "Explore the collective archives of digital builds and game projects from the REY community.",
};

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  let profile = null;

  if (session?.user?.id) {
    await dbConnect();
    profile = await User.findById(session.user.id).lean();
    profile = JSON.parse(JSON.stringify(profile));
  }

  const projects = await getProjects();

  return (
    <ProjectsClient 
      initialProjects={projects} 
      initialProfile={profile} 
    />
  );
}
