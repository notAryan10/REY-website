import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import Project from "@/models/Project";
import Resource from "@/models/Resource";

export async function getFrontierData() {
  await dbConnect();

  const [events, projects, resources] = await Promise.all([
    Event.find({ isPublic: true, type: { $ne: "workshop" } })
      .sort({ date: 1 })
      .limit(1)
      .lean(),
    Project.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(1)
      .populate("uploadedBy", "name role")
      .lean(),
    Resource.find({ accessLevel: "public" })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean(),
  ]);

  return {
    latestEvent: JSON.parse(JSON.stringify(events[0] || null)),
    latestProject: JSON.parse(JSON.stringify(projects[0] || null)),
    latestResource: JSON.parse(JSON.stringify(resources[0] || null)),
  };
}

export async function getEvents(userRole: string = "spectator") {
  await dbConnect();
  const query: { isPublic?: boolean; type?: string | { $ne: string } } = {};

  if (userRole === "spectator") {
    query.isPublic = true;
    query.type = { $ne: "workshop" };
  }

  const events = await Event.find(query).sort({ date: 1 }).lean();
  return JSON.parse(JSON.stringify(events));
}

export async function getProjects() {
  await dbConnect();
  const projects = await Project.find({ status: "published" })
    .sort({ createdAt: -1 })
    .populate("uploadedBy", "name role")
    .lean();
  return JSON.parse(JSON.stringify(projects));
}

export async function getResources(userRole: string = "spectator") {
  await dbConnect();
  const query: { accessLevel?: string } = {};

  if (userRole === "spectator") {
    query.accessLevel = "public";
  }

  const resources = await Resource.find(query).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(resources));
}
