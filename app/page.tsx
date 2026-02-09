import { Button } from "@/components/ui/button";
import Logout from "@/modules/auth/components/logout";
import { requireAuth } from "@/modules/auth/utils/auth-utils";
import { redirect } from "next/navigation";

export default async function Home() {
  await requireAuth()
  return redirect('/dashboard')
  // return (
  // <div className="min-h-screen bg-background flex items-center justify-center px-4">
  //   <div className="w-full max-w-xl rounded-xl border bg-card p-8 shadow-md">
  //     <div className="flex flex-col gap-6">

  //       <div className="space-y-2">
  //         <h1 className="text-2xl font-semibold text-foreground">
  //           Code Council
  //         </h1>
  //         <p className="text-sm text-muted-foreground">
  //           Your AI reviewer is ready. Connect a repository to begin.
  //         </p>
  //       </div>

  //       {/* Placeholder CTA */}
  //       <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
  //         No repositories connected yet.
  //       </div>

  //       {/* Footer actions */}
  //       <div className="flex justify-end">
  //         <Logout>
  //           <Button variant="outline" size="sm">
  //             Logout
  //           </Button>
  //         </Logout>
  //       </div>
  //     </div>
  //   </div>
  // </div>

  //)
}
