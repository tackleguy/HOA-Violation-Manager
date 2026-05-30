"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Alert variant="success">
        <AlertTitle>Message sent</AlertTitle>
        <AlertDescription>Thanks for reaching out. Our team will respond within one business day.</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input id="contact-name" name="name" required placeholder="Jane Boardmember" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" name="email" type="email" required placeholder="jane@community.org" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-community">Community</Label>
        <Input id="contact-community" name="community" placeholder="Oak Ridge HOA" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">How can we help?</Label>
        <Textarea id="contact-message" name="message" required rows={5} placeholder="Tell us about your community size and current tools." />
      </div>
      <Button type="submit" disabled={loading}>
        <Send className="h-4 w-4" />
        {loading ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
