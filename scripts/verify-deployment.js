// Polls the Render deploy's health endpoint and rolls back if it never goes healthy.
// ponytail: uses global fetch (Node 18+) — axios was never a dependency of this repo.

const MAX_RETRIES = 10;
const RETRY_INTERVAL = 30000; // 30 seconds

async function getJSON(url, options = {}) {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000), ...options });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return res.json();
}

async function verifyAndRollback() {
    const DEPLOY_URL = process.env.DEPLOY_URL;
    const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID;
    const RENDER_API_KEY = process.env.RENDER_API_KEY;
    const CURRENT_SHA = process.env.GITHUB_SHA;

    if (!DEPLOY_URL || !RENDER_SERVICE_ID || !RENDER_API_KEY) {
        console.error("❌ Missing required environment variables (DEPLOY_URL, RENDER_SERVICE_ID, RENDER_API_KEY)");
        process.exit(1);
    }

    const HEALTH_ENDPOINT = `${DEPLOY_URL.replace(/\/$/, "")}/api/health`;
    console.log(`📡 Starting deployment verification for: ${DEPLOY_URL}`);

    for (let i = 1; i <= MAX_RETRIES; i++) {
        try {
            console.log(`🔍 Health Check Attempt ${i}/${MAX_RETRIES}...`);
            const body = await getJSON(HEALTH_ENDPOINT);

            if (body.status === "healthy") {
                console.log("✅ Deployment verified: System is healthy.");
                process.exit(0);
            }
            console.warn(`⚠️  Attempt ${i}: reported status "${body.status}"`);
        } catch (error) {
            console.warn(`⚠️  Attempt ${i} failed: ${error.message}`);
        }

        if (i < MAX_RETRIES) {
            console.log(`Waiting ${RETRY_INTERVAL / 1000}s before next attempt...`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
        }
    }

    console.error("🚨 HEALTH CHECK FAILED: System is unstable or unreachable.");
    console.log("🚀 INITIALIZING AUTOMATED ROLLBACK PROTOCOL...");

    try {
        const auth = { Authorization: `Bearer ${RENDER_API_KEY}` };
        const deployments = await getJSON(
            `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys?limit=20`,
            { headers: auth }
        );

        // The broken deploy is itself "live" (running, just unhealthy), so skip
        // anything built from the commit we just shipped or we roll back to it.
        const previousDeploy = deployments.find(
            (d) => d.deploy.status === "live" && d.deploy.commit?.id !== CURRENT_SHA
        );

        if (previousDeploy) {
            console.log(`Reverting to stable deployment: ${previousDeploy.deploy.id}`);
            await getJSON(`https://api.render.com/v1/services/${RENDER_SERVICE_ID}/rollback`, {
                method: "POST",
                headers: { ...auth, "Content-Type": "application/json" },
                body: JSON.stringify({ deployId: previousDeploy.deploy.id }),
            });
            console.log("✅ Rollback request submitted successfully.");
        } else {
            console.error("❌ Could not identify a stable previous deployment to rollback to.");
        }
    } catch (rollbackError) {
        console.error(`❌ ROLLBACK CRITICAL FAILURE: ${rollbackError.message}`);
    }

    process.exit(1);
}

verifyAndRollback();
