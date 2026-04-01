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

  const CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
  if (!CHAT_ID) throw new Error('TELEGRAM_CHAT_ID is not configured');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    const { phone } = await req.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: 'Phone number required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create verification request
    const { data: verReq, error: dbErr } = await supabase
      .from('verification_requests')
      .insert({ phone, status: 'pending' })
      .select()
      .single();

    if (dbErr) throw new Error(dbErr.message);

    // Send Telegram message with inline keyboard
    const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: `📱 *Phone Verification Request*\n\nPhone: \`${phone}\`\nRequest ID: \`${verReq.id}\`\n\nPlease verify or reject this number.`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Verify', callback_data: `verify_${verReq.id}` },
            { text: '📝 Register', callback_data: `register_${verReq.id}` },
            { text: '❌ Reject', callback_data: `reject_${verReq.id}` },
          ]],
        },
      }),
    });

    const tgData = await response.json();
    if (!response.ok) {
      throw new Error(`Telegram API failed [${response.status}]: ${JSON.stringify(tgData)}`);
    }

    // Save telegram message id
    await supabase
      .from('verification_requests')
      .update({ telegram_message_id: tgData.result.message_id })
      .eq('id', verReq.id);

    return new Response(JSON.stringify({ id: verReq.id }), {
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
