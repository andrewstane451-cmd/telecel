import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, Banknote, Percent, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileShell from "@/components/MobileShell";

interface LoanData {
  firstName: string;
  lastName: string;
  loanAmount: number;
  repaymentMonths: number;
  interest: number;
  monthlyPayment: string;
  totalRepayment: string;
}

const SuccessPage = () => {
  const navigate = useNavigate();
  const [loan, setLoan] = useState<LoanData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("telecel_loan");
    if (saved) {
      setLoan(JSON.parse(saved));
      localStorage.removeItem("telecel_loan");
    }
  }, []);

  const details = [
    { icon: Banknote, label: "Loan Amount", value: `GHS ${loan?.loanAmount?.toLocaleString() ?? "—"}` },
    { icon: CalendarDays, label: "Repayment Period", value: `${loan?.repaymentMonths ?? "—"} months` },
    { icon: Percent, label: "Interest Rate", value: `${loan?.interest ?? "—"}%` },
    { icon: Banknote, label: "Monthly Payment", value: `GHS ${loan?.monthlyPayment ?? "—"}` },
    { icon: Banknote, label: "Total Repayment", value: `GHS ${loan?.totalRepayment ?? "—"}` },
  ];

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {/* Success icon */}
        <div className="animate-check-pop mb-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-foreground text-center">Application Submitted!</h1>
        <p className="text-sm text-muted-foreground text-center mt-2 max-w-[280px]">
          {loan?.firstName ? `Hi ${loan.firstName}, your` : "Your"} loan is being approved and will be disbursed within <span className="font-semibold text-primary">12 hours</span>.
        </p>

        {/* Loan summary */}
        <div className="w-full mt-6 bg-accent/50 rounded-xl p-4 space-y-3">
          {details.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <d.icon className="w-4 h-4" />
                <span>{d.label}</span>
              </div>
              <span className="font-semibold">{d.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-5 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Estimated disbursement: 12 hours</span>
        </div>
      </div>

      <div className="px-6 pb-6">
        <Button onClick={() => navigate("/")} className="w-full h-12 rounded-xl font-semibold">
          Done
        </Button>
      </div>
    </MobileShell>
  );
};

export default SuccessPage;
