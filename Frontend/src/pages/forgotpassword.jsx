import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-xl rounded-2xl">
        <CardContent>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Forgot Password</h2>

            <div className="space-y-2">
              <Label htmlFor="email">Username or Email</Label>
              <Input id="email" type="text" placeholder="Enter your username or email" />
            </div>

            <Button className="w-full">Send OTP</Button>

            <div className="text-center">
              <Link to="/signin" className="text-sm text-blue-600 hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
