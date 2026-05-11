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
  screenshots?: string[];
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
      const response = await fetch(rssUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 R.E.Y-Scanner/1.0' }
      });
      
      if (response.ok) {
        const xml = await response.text();
        const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
        
        if (items.length > 0) {
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
        }
      }

      // FALLBACK: HTML Scraping if RSS fails or is empty
      const profileUrl = `https://${sub}.itch.io`;
      const htmlResponse = await fetch(profileUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 R.E.Y-Scanner/1.0' }
      });

      if (htmlResponse.ok) {
        const html = await htmlResponse.text();
        const games: ItchGame[] = [];
        
        // ULTIMATE FALLBACK: Match any div that looks like a game cell (using common IDs and classes)
        const cellMatches = html.matchAll(/<div[^>]*data-game_id="(\d+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g);
        
        for (const match of cellMatches) {
          const content = match[2];
          const gameId = match[1];
          
          const title = content.match(/<a[^>]*class="game_link"[^>]*>(.*?)<\/a>/)?.[1] || 
                        content.match(/<div[^>]*class="game_title"[^>]*>.*?>(.*?)<\/a>/)?.[1] || "";
          
          let url = content.match(/<a[^>]*class="game_link"[^>]*href="(.*?)"/)?.[1] || "";
          // Relative URL fix
          if (url && !url.startsWith("http")) {
            url = `https://${sub}.itch.io${url.startsWith("/") ? "" : "/"}${url}`;
          }

          const coverImage = content.match(/data-lazy_src="(.*?)"/)?.[1] || 
                             content.match(/<img[^>]*src="(.*?)"/)?.[1] || "";
          
          const description = content.match(/<div[^>]*class="game_text"[^>]*title="(.*?)"/)?.[1] || 
                              content.match(/<div[^>]*class="game_text"[^>]*>(.*?)<\/div>/)?.[1] || "";
          
          if (title && url) {
            games.push({ 
              id: gameId,
              title: title.replace(/<[^>]*>?/gm, '').trim(), 
              url, 
              coverImage, 
              description: description.replace(/<[^>]*>?/gm, '').trim() 
            });
          }
        }

        // SECONDARY FALLBACK: Match anything with game_title if data-game_id failed
        if (games.length === 0) {
          const titleMatches = html.matchAll(/<div[^>]*class="game_title"[^>]*>.*?<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/g);
          for (const match of titleMatches) {
            let url = match[1];
            if (url && !url.startsWith("http")) url = `https://${sub}.itch.io${url.startsWith("/") ? "" : "/"}${url}`;
            games.push({
              title: match[2].replace(/<[^>]*>?/gm, '').trim(),
              url,
              coverImage: "",
              description: ""
            });
          }
        }

        if (games.length > 0) return games;
      }
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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 R.E.Y-Metadata-Scanner/1.0'
      }
    });
    if (!response.ok) return {};

    const html = await response.text();
    
    const title = html.match(/<meta property="og:title" content="(.*?)"/)?.[1] || 
                  html.match(/<h1 class="game_title">(.*?)<\/h1>/)?.[1] || "";
    const coverImage = html.match(/<meta property="og:image" content="(.*?)"/)?.[1] || 
                       html.match(/<img class="header_image" src="(.*?)"/)?.[1] || "";
    const description = html.match(/<meta property="og:description" content="(.*?)"/)?.[1] || "";
    
    // Extract tags (usually in .game_info_panel or as specific meta tags)
    const tags: string[] = [];
    const tagMatches = html.matchAll(/<a href="https:\/\/itch\.io\/games\/tag-(.*?)">(.*?)<\/a>/g);
    for (const match of tagMatches) {
      if (match[2] && !tags.includes(match[2])) tags.push(match[2]);
    }

    // Try to detect engine from common tags in description or meta tags
    let engine = "Other";
    const lowerHtml = html.toLowerCase();
    if (lowerHtml.includes("unity")) engine = "Unity";
    else if (lowerHtml.includes("godot")) engine = "Godot";
    else if (lowerHtml.includes("unreal")) engine = "Unreal Engine";
    else if (lowerHtml.includes("gamemaker")) engine = "GameMaker";
    else if (lowerHtml.includes("rpg maker")) engine = "RPG Maker";
    else if (lowerHtml.includes("webgl") || lowerHtml.includes("html5")) engine = "WebGL";
    else if (lowerHtml.includes("twine")) engine = "Twine";

    // Extract screenshots
    const screenshots: string[] = [];
    const screenshotMatches = html.matchAll(/<a href="(.*?)" data-screenshot_id/g);
    for (const match of screenshotMatches) {
      if (match[1] && !screenshots.includes(match[1])) screenshots.push(match[1]);
    }

    return { title, coverImage, description, engine, tags, screenshots };
  } catch (error) {
    console.error("Error fetching Itch.io project metadata:", error);
    return {};
  }
}
