import { ReactNode } from "react";

const MobileShell = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen items-start justify-center bg-muted py-4 px-2">
    <div className="w-full max-w-[420px] min-h-[90vh] bg-card rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {children}
    </div>
  </div>
);

export default MobileShell;
