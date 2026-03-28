import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";

export default function Login() {
  const { actor } = useActor();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) {
      toast.error("App not ready yet, please try again.");
      return;
    }
    setLoading(true);
    try {
      const result = await actor.loginUser(email.trim(), password);
      if (result.__kind__ === "ok") {
        login(result.ok);
        navigate({ to: "/" });
      } else {
        toast.error(result.err || "Invalid email or password");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.16 0.04 247) 0%, oklch(0.22 0.055 247) 60%, oklch(0.18 0.045 250) 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <img
            src="/assets/uploads/gemini_generated_image_5j6l4b5j6l4b5j6l-019d3531-a5fa-75ff-8e99-4828ec3a6f02-1.png"
            alt="Westlake Little League"
            className="h-16 w-16 rounded-full object-cover shadow-lg"
          />
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">
              Westlake Little League
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "oklch(0.65 0.025 250)" }}
            >
              Equipment Tracker
            </p>
          </div>
        </div>

        <Card
          className="border-0 shadow-2xl"
          style={{
            background: "oklch(0.19 0.04 248)",
            borderColor: "oklch(0.28 0.04 247)",
          }}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-center text-lg">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm"
                  style={{ color: "oklch(0.75 0.02 250)" }}
                >
                  Email
                </Label>
                <Input
                  data-ocid="login.input"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="border-0 text-white placeholder:text-white/30"
                  style={{ background: "oklch(0.26 0.04 248)", color: "white" }}
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm"
                  style={{ color: "oklch(0.75 0.02 250)" }}
                >
                  Password
                </Label>
                <Input
                  data-ocid="login.input"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="border-0 text-white placeholder:text-white/30"
                  style={{ background: "oklch(0.26 0.04 248)", color: "white" }}
                />
              </div>
              <Button
                data-ocid="login.submit_button"
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold mt-2"
                style={{ background: "oklch(0.55 0.17 25)", border: "none" }}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
            <p
              className="text-center text-sm mt-5"
              style={{ color: "oklch(0.6 0.02 250)" }}
            >
              Don't have an account?{" "}
              <a
                href="/signup"
                className="font-medium hover:underline"
                style={{ color: "oklch(0.72 0.1 210)" }}
              >
                Create one
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
