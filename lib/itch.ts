/**
 * Itch.io Integration Utility
 * Handles fetching game metadata from public Itch.io profiles and game pages.
 */

export interface ItchGame {
  title: string;
  url: string;
  coverImage: string;
  description: string;
  id?: string;
  engine?: string;
  tags?: string[];
}

/**
 * Sanitizes an Itch.io username for use in subdomains.
 * Itch.io often converts underscores to hyphens in URLs.
 */
function getItchSubdomains(username: string): string[] {
  const primary = username.toLowerCase();
  const secondary = primary.replace(/_/g, "-");
  return primary === secondary ? [primary] : [primary, secondary];
}

/**
 * Fetches public games for a given Itch.io username.
 * Primarily uses the user's games RSS feed.
 */
export async function fetchUserItchGames(username: string): Promise<ItchGame[]> {
  const subdomains = getItchSubdomains(username);
  let lastError: any = null;

  for (const sub of subdomains) {
    try {
      const rssUrl = `https://${sub}.itch.io/games.xml`;
      const response = await fetch(rssUrl);
      
      if (!response.ok) continue;

      const xml = await response.text();
      const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
      
      return items.map(item => {
        const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                      item.match(/<title>(.*?)<\/title>/)?.[1] || "";
        const url = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
        const coverImage = item.match(/<itunes:image href="(.*?)"\/>/)?.[1] || 
                           item.match(/<media:content url="(.*?)"/)?.[1] || "";
        const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || 
                            item.match(/<description>(.*?)<\/description>/)?.[1] || "";
        
        return { title, url, coverImage, description };
      });
    } catch (error) {
      lastError = error;
    }
  }

  console.error("Error fetching Itch.io games for subdomains:", subdomains, lastError);
  return [];
}

/**
 * Fetches OpenGraph metadata for a specific Itch.io game page.
 */
export async function fetchItchProjectMetadata(url: string): Promise<Partial<ItchGame>> {
  try {
    const response = await fetch(url);
    if (!response.ok) return {};

    const html = await response.text();
    
    const title = html.match(/<meta property="og:title" content="(.*?)"/)?.[1] || "";
    const coverImage = html.match(/<meta property="og:image" content="(.*?)"/)?.[1] || "";
    const description = html.match(/<meta property="og:description" content="(.*?)"/)?.[1] || "";
    
    // Try to detect engine from common tags in description or meta tags
    let engine = "Other";
    if (html.toLowerCase().includes("unity")) engine = "Unity";
    else if (html.toLowerCase().includes("godot")) engine = "Godot";
    else if (html.toLowerCase().includes("unreal")) engine = "Unreal Engine";
    else if (html.toLowerCase().includes("gamemaker")) engine = "GameMaker";
    else if (html.toLowerCase().includes("webgl") || html.toLowerCase().includes("html5")) engine = "WebGL";

    return { title, coverImage, description, engine };
  } catch (error) {
    console.error("Error fetching Itch.io project metadata:", error);
    return {};
  }
}
