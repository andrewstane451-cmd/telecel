import { useNavigate } from "react-router-dom";
import { Check, ShieldCheck, Phone, CreditCard, Users, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileShell from "@/components/MobileShell";

const requirements = [
  { icon: CreditCard, text: "Valid Ghana Card or National ID" },
  { icon: Phone, text: "Active Telecel mobile number" },
  { icon: Users, text: "Must be 18 years or older" },
  { icon: Banknote, text: "Steady source of income" },
  { icon: ShieldCheck, text: "No outstanding loans with Telecel" },
];

const LoanRequirements = () => {
  const navigate = useNavigate();

  return (
    <MobileShell>
      {/* Header */}
      <div className="telecel-gradient px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
          <Banknote className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-primary-foreground">Telecel Quick Loan</h1>
        <p className="text-primary-foreground/80 mt-1 text-sm">Get instant cash in minutes</p>
      </div>

      {/* Requirements list */}
      <div className="flex-1 px-6 py-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Loan Requirements</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Please ensure you meet the following requirements before applying.
        </p>

        <div className="space-y-4">
          {requirements.map((req, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-accent/50 border border-border">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <req.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground flex-1">{req.text}</span>
              <Check className="w-5 h-5 text-primary" />
            </div>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <div className="px-6 pb-6">
        <Button
          onClick={() => navigate("/apply")}
          className="w-full h-12 text-base font-semibold rounded-xl"
        >
          Continue
        </Button>
      </div>
    </MobileShell>
  );
};

export default LoanRequirements;
