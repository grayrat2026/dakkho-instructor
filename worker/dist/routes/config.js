/**
 * Config routes — GET, PUT, PUT /reset
 * Uses D1 for persistence and KV for broadcast (replaces MQTT)
 */
import { Hono } from 'hono';
import { adminAuthMiddleware } from '../lib/auth';
import { DEFAULT_CONFIG } from '../lib/types';
import { logAudit } from '../lib/audit';
import { getErrorMessage } from '../lib/utils';
const configRoutes = new Hono();
// Apply auth middleware to all config routes
configRoutes.use('*', adminAuthMiddleware);
// GET / — Get current config
configRoutes.get('/', async (c) => {
    try {
        // First try KV cache
        const cachedConfig = await c.env.KV_CONFIG.get('server_config', 'json');
        if (cachedConfig) {
            return c.json(cachedConfig);
        }
        // Fall back to D1
        const { results } = await c.env.DB.prepare('SELECT key, value FROM app_config').all();
        const configMap = {};
        for (const row of results) {
            try {
                configMap[row.key] = JSON.parse(row.value);
            }
            catch {
                configMap[row.key] = row.value;
            }
        }
        const config = {
            featureToggles: { ...DEFAULT_CONFIG.featureToggles, ...configMap.featureToggles },
            homePageSections: configMap.homePageSections || DEFAULT_CONFIG.homePageSections,
            sidebarVisibility: { ...DEFAULT_CONFIG.sidebarVisibility, ...configMap.sidebarVisibility },
            bottomNavTabs: configMap.bottomNavTabs || DEFAULT_CONFIG.bottomNavTabs,
            topBarElements: { ...DEFAULT_CONFIG.topBarElements, ...configMap.topBarElements },
            cardStyle: configMap.cardStyle || DEFAULT_CONFIG.cardStyle,
            contentProtection: { ...DEFAULT_CONFIG.contentProtection, ...configMap.contentProtection },
        };
        // Cache in KV
        await c.env.KV_CONFIG.put('server_config', JSON.stringify(config), { expirationTtl: 300 });
        return c.json(config);
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// PUT / — Update config
configRoutes.put('/', async (c) => {
    try {
        const config = await c.req.json();
        const sections = {
            featureToggles: config.featureToggles,
            homePageSections: config.homePageSections,
            sidebarVisibility: config.sidebarVisibility,
            bottomNavTabs: config.bottomNavTabs,
            topBarElements: config.topBarElements,
            cardStyle: config.cardStyle,
            contentProtection: config.contentProtection,
        };
        // Upsert each section into D1
        for (const [key, value] of Object.entries(sections)) {
            await c.env.DB.prepare(`INSERT INTO app_config (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`)
                .bind(key, JSON.stringify(value))
                .run();
        }
        // Update KV cache (replaces MQTT broadcast)
        await c.env.KV_CONFIG.put('server_config', JSON.stringify(config));
        // Set a config-updated timestamp so clients can poll for changes
        await c.env.KV_CONFIG.put('config_updated_at', new Date().toISOString());
        const user = c.get('user');
        await logAudit(c.env, user.id, 'UPDATE_CONFIG', 'config', undefined, config);
        return c.json({ success: true, config });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
// PUT /reset — Reset config to defaults
configRoutes.put('/reset', async (c) => {
    try {
        const config = DEFAULT_CONFIG;
        const sections = {
            featureToggles: config.featureToggles,
            homePageSections: config.homePageSections,
            sidebarVisibility: config.sidebarVisibility,
            bottomNavTabs: config.bottomNavTabs,
            topBarElements: config.topBarElements,
            cardStyle: config.cardStyle,
            contentProtection: config.contentProtection,
        };
        for (const [key, value] of Object.entries(sections)) {
            await c.env.DB.prepare(`INSERT INTO app_config (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`)
                .bind(key, JSON.stringify(value))
                .run();
        }
        await c.env.KV_CONFIG.put('server_config', JSON.stringify(config));
        await c.env.KV_CONFIG.put('config_updated_at', new Date().toISOString());
        const user = c.get('user');
        await logAudit(c.env, user.id, 'RESET_CONFIG', 'config', undefined, { action: 'reset_to_defaults' });
        return c.json({ success: true, config });
    }
    catch (error) {
        const message = getErrorMessage(error);
        return c.json({ error: message }, 500);
    }
});
export default configRoutes;
