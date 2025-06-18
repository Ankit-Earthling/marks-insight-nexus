
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, User, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminLoginProps {
  onBack: () => void;
  onLogin: () => void;
}

const AdminLogin = ({ onBack, onLogin }: AdminLoginProps) => {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Error",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // For demo purposes, we'll use simple credential check
      // In production, you'd want proper password hashing and verification
      const { data: admins, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', credentials.username)
        .single();

      if (error || !admins) {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Simple password check (in production, use proper bcrypt verification)
      if (credentials.password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUser', JSON.stringify(admins));
        toast({
          title: "Login Successful",
          description: `Welcome, ${admins.username}!`,
        });
        onLogin();
      } else {
        toast({
          title: "Login Failed", 
          description: "Invalid username or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-white/20 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-white mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Login</h1>
              <p className="text-blue-100">Secure access to administration panel</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl animate-slide-in">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full w-20 h-20 flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Administrator Access</CardTitle>
              <CardDescription>
                Enter your admin credentials to manage student records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="username" className="flex items-center text-gray-700">
                  <User className="h-4 w-4 mr-2" />
                  Username
                </Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  placeholder="Enter admin username"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="flex items-center text-gray-700">
                  <Lock className="h-4 w-4 mr-2" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  placeholder="Enter password"
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3"
              >
                {isLoading ? "Logging in..." : "Access Admin Panel"}
              </Button>

              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 font-medium mb-2">Demo Credentials:</p>
                <div className="text-xs text-red-700 space-y-1">
                  <div>Username: admin</div>
                  <div>Password: admin123</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
