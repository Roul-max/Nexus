import { AppLayout } from "@/components/layout/AppLayout";
import { CrmHeader } from "./CrmHeader";

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <CrmHeader />
        <main>
          {children}
        </main>
      </div>
    </AppLayout>
  );
}