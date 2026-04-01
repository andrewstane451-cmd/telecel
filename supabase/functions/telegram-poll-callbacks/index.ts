import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

  const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
  if (!TELEGRAM_API_KEY) throw new Error('TELEGRAM_API_KEY is not configured');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const MAX_RUNTIME_MS = 55_000;
  const startTime = Date.now();

  try {
    let totalProcessed = 0;

    while (true) {
      const elapsed = Date.now() - startTime;
      const remainingMs = MAX_RUNTIME_MS - elapsed;
      if (remainingMs < 5000) break;

      const timeout = Math.min(30, Math.floor(remainingMs / 1000) - 3);
      if (timeout < 1) break;

      let response;
      try {
        response = await fetch(`${GATEWAY_URL}/getUpdates`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'X-Connection-Api-Key': TELEGRAM_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timeout,
            allowed_updates: ['callback_query'],
          }),
        });
      } catch (e) {
        console.error('Fetch error:', e);
        break;
      }

      const data = await response.json();
      if (!response.ok) {
        // 409 = conflict with another getUpdates, just retry after a short delay
        if (response.status === 409) {
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        console.error(`Telegram API error [${response.status}]:`, data);
        break;
      }

      const updates = data.result ?? [];
      if (updates.length === 0) continue;

      for (const update of updates) {
        if (!update.callback_query) continue;

        const callbackData = update.callback_query.data;
        const callbackId = update.callback_query.id;

        const match = callbackData.match(/^(verify|reject|register)_(.+)$/);
        if (!match) continue;

        const [, action, requestId] = match;
        const statusMap: Record<string, string> = { verify: 'verified', reject: 'rejected', register: 'register' };
        const status = statusMap[action] || 'pending';

        // Update DB
        await supabase
          .from('verification_requests')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', requestId);

        // Answer callback query
        await fetch(`${GATEWAY_URL}/answerCallbackQuery`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'X-Connection-Api-Key': TELEGRAM_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: status === 'verified' ? '✅ Verified!' : status === 'register' ? '📝 Register!' : '❌ Rejected!',
          }),
        });

        totalProcessed++;
      }

      // Confirm offset
      const maxUpdateId = Math.max(...updates.map((u: any) => u.update_id));
      await fetch(`${GATEWAY_URL}/getUpdates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'X-Connection-Api-Key': TELEGRAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offset: maxUpdateId + 1, timeout: 0 }),
      });
    }

    return new Response(JSON.stringify({ ok: true, processed: totalProcessed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
