import { OnboardingForm } from "@/components/dashboard/OnboardingForm"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OnboardingPage() {
  return (
    <div className="container max-w-2xl py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">← Back</Link>
        </Button>
        <h1 className="text-3xl font-bold">New Patient Intake</h1>
      </div>
      <OnboardingForm />
    </div>
  )
}