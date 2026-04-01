import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileShell from "@/components/MobileShell";

const RejectedPage = () => {
  const navigate = useNavigate();

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="mb-4">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-foreground text-center">Verification Rejected</h1>
        <p className="text-sm text-muted-foreground text-center mt-2 max-w-[280px]">
          Your phone number verification was rejected. Please try again or contact support for assistance.
        </p>
      </div>

      <div className="px-6 pb-6 space-y-3">
        <Button onClick={() => navigate("/verify")} className="w-full h-12 rounded-xl font-semibold">
          Try Again
        </Button>
        <Button onClick={() => navigate("/")} variant="outline" className="w-full h-12 rounded-xl font-semibold border-primary text-primary">
          Go Home
        </Button>
      </div>
    </MobileShell>
  );
};

export default RejectedPage;
