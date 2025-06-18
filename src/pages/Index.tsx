
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Shield, Users, BookOpen } from "lucide-react";
import AdminLogin from "@/components/AdminLogin";
import AdminPanel from "@/components/AdminPanel";
import StudentPortal from "@/components/StudentPortal";

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<"admin" | "student" | "adminLogin" | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in
    const adminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (adminLoggedIn === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleAdminAccess = () => {
    if (isAdminLoggedIn) {
      setSelectedRole("admin");
    } else {
      setSelectedRole("adminLogin");
    }
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setSelectedRole("admin");
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    setIsAdminLoggedIn(false);
    setSelectedRole(null);
  };

  if (selectedRole === "adminLogin") {
    return <AdminLogin onBack={() => setSelectedRole(null)} onLogin={handleAdminLogin} />;
  }

  if (selectedRole === "admin") {
    return <AdminPanel onBack={() => setSelectedRole(null)} onLogout={handleLogout} />;
  }

  if (selectedRole === "student") {
    return <StudentPortal onBack={() => setSelectedRole(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="h-16 w-16 text-white mr-4" />
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">
                BMSIT&M
              </h1>
              <p className="text-2xl text-blue-100 font-semibold">
                RESULT PORTAL
              </p>
            </div>
          </div>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Comprehensive student marks management system for BMSIT&M College. 
            Access your results or manage student data with our secure portal.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin Panel Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/95 backdrop-blur-sm animate-slide-in">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Admin Panel
              </CardTitle>
              <CardDescription className="text-gray-600">
                Upload and manage student marks for all subjects
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-center justify-center">
                  <BookOpen className="h-4 w-4 mr-2 text-red-500" />
                  Manage 5 core subjects
                </li>
                <li className="flex items-center justify-center">
                  <Users className="h-4 w-4 mr-2 text-red-500" />
                  Add student data (USN, DOB)
                </li>
                <li className="flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 mr-2 text-red-500" />
                  Upload marks & generate reports
                </li>
              </ul>
              <Button 
                onClick={handleAdminAccess}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isAdminLoggedIn ? "Access Admin Panel" : "Admin Login"}
              </Button>
            </CardContent>
          </Card>

          {/* Student Portal Card */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 bg-white/95 backdrop-blur-sm animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-20 h-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Student Portal
              </CardTitle>
              <CardDescription className="text-gray-600">
                View your marks and download your markscard
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-center justify-center">
                  <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                  View marks for all subjects
                </li>
                <li className="flex items-center justify-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                  Secure login with USN & DOB
                </li>
                <li className="flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                  Download official markscard
                </li>
              </ul>
              <Button 
                onClick={() => setSelectedRole("student")}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Student Login
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/80 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-sm">
            © 2024 BMSIT&M College. All rights reserved. | Secure Result Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
