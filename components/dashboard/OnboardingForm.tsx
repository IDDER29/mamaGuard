"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/utils/supabase/client"
import { useState } from "react" // Added for success state
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner" // Optional: recommended for hackathons

const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[\d\s+\-()]+$/, "Enter a valid phone number"),
  due_date: z.string().min(1, "Due date is required"),
  gestational_week: z.coerce
    .number()
    .int()
    .min(1, "Must be at least 1")
    .max(42, "Must be at most 42"),
  chronic_conditions: z.string().optional(),
  previous_c_sections: z.coerce
    .number()
    .int()
    .min(0, "Must be 0 or more")
    .default(0),
})

type PatientFormValues = z.infer<typeof patientSchema>

export function OnboardingForm() {
  const [isSuccess, setIsSuccess] = useState(false)
  
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      due_date: "",
      // Use 1 instead of undefined to keep the input controlled
      gestational_week: 1, 
      chronic_conditions: "",
      previous_c_sections: 0,
    },
  })

  async function onSubmit(values: PatientFormValues) {
    const supabase = createClient()
    
    // Flattened the insert to match your SQL schema columns
    const { error } = await supabase.from("patients").insert({
      name: values.name.trim(),
      phone_number: values.phone_number.trim().replace(/\s/g, ""),
      due_date: values.due_date,
      gestational_week: values.gestational_week,
      // If your DB has a JSONB medical_history column, use this:
      // medical_history: { 
      //   conditions: values.chronic_conditions, 
      //   c_sections: values.previous_c_sections 
      // }
    })

    if (error) {
      console.error(error)
      form.setError("root", { message: error.message })
      return
    }

    setIsSuccess(true)
    form.reset()
    setTimeout(() => setIsSuccess(false), 3000)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
            <CardDescription>
              Basic information for the new pregnant patient.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Fatima Zahra" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="e.g. +212612345678"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gestational_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Week</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>
              Identify pre-existing risk factors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="chronic_conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chronic Conditions</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. diabetes, hypertension"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="previous_c_sections"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous C-sections</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {form.formState.errors.root && (
          <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md">
            {form.formState.errors.root.message}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-100 border border-green-500 text-green-700 text-sm rounded-md">
            Patient successfully registered!
          </div>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Processing..." : "Register Patient"}
        </Button>
      </form>
    </Form>
  )
}