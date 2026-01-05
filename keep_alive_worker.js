export default {
    // 1. 浏览器访问时的响应（用于测试 Worker 是否存活）
    async fetch(request, env, ctx) {
        return new Response('Koyeb Keep-Alive Worker is running.\n\nTarget:\n- https://protective-laverne-bugpiao-e66edb41.koyeb.app/', { status: 200 });
    },

    // 2. 定时任务触发时的逻辑（核心保活代码）
    async scheduled(event, env, ctx) {
        // 待 Ping 的目标列表
        const targets = [
            'https://protective-laverne-bugpiao-e66edb41.koyeb.app/' // Koyeb 原生域名 (关键：用于唤醒/保持实例活跃)
        ];

        console.log(`[Cron: ${event.cron}] Starting pings...`);

        for (const url of targets) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 增加超时到 15 秒，应对冷启动

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Cloudflare-Worker-KeepAlive/1.0'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                console.log(`Ping ${url} - Status: ${response.status}`);
            } catch (error) {
                console.error(`Ping ${url} - Failed: ${error.message}`);
            }
        }
    }
};
