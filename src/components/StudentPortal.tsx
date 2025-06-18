
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Calendar, GraduationCap, Download, Star, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  usn: string;
  name: string;
  dob: string;
  marks: {
    DSA: number;
    ADA: number;
    DBMS: number;
    JAVA: number;
    OS: number;
  };
}

interface StudentPortalProps {
  onBack: () => void;
}

const StudentPortal = ({ onBack }: StudentPortalProps) => {
  const [loginData, setLoginData] = useState({ usn: "", dob: "" });
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Mock student data - in real app, this would come from database
  const mockStudents: Student[] = [
    {
      usn: "1BM20CS001",
      name: "John Doe",
      dob: "2002-05-15",
      marks: { DSA: 85, ADA: 78, DBMS: 92, JAVA: 88, OS: 81 }
    },
    {
      usn: "1BM20CS002", 
      name: "Jane Smith",
      dob: "2002-03-22",
      marks: { DSA: 90, ADA: 85, DBMS: 89, JAVA: 94, OS: 87 }
    }
  ];

  const subjects = [
    { code: "DSA", name: "Data Structures & Algorithms", credits: 4 },
    { code: "ADA", name: "Analysis & Design of Algorithms", credits: 4 },
    { code: "DBMS", name: "Database Management Systems", credits: 4 },
    { code: "JAVA", name: "Java Programming", credits: 4 },
    { code: "OS", name: "Operating Systems", credits: 4 }
  ];

  const handleLogin = async () => {
    if (!loginData.usn || !loginData.dob) {
      toast({
        title: "Error",
        description: "Please enter both USN and Date of Birth",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const student = mockStudents.find(
        s => s.usn.toLowerCase() === loginData.usn.toLowerCase() && s.dob === loginData.dob
      );

      if (student) {
        setLoggedInStudent(student);
        toast({
          title: "Login Successful",
          description: `Welcome, ${student.name}!`,
        });
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid USN or Date of Birth",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const calculateTotal = (marks: Student['marks']) => {
    return Object.values(marks).reduce((sum, mark) => sum + mark, 0);
  };

  const calculatePercentage = (marks: Student['marks']) => {
    const total = calculateTotal(marks);
    return ((total / 500) * 100).toFixed(2);
  };

  const getGrade = (marks: number) => {
    if (marks >= 90) return { grade: "A+", color: "text-green-600" };
    if (marks >= 80) return { grade: "A", color: "text-green-500" };
    if (marks >= 70) return { grade: "B+", color: "text-blue-600" };
    if (marks >= 60) return { grade: "B", color: "text-blue-500" };
    if (marks >= 50) return { grade: "C", color: "text-yellow-600" };
    return { grade: "F", color: "text-red-600" };
  };

  const getOverallGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A+", color: "text-green-600", status: "Distinction" };
    if (percentage >= 80) return { grade: "A", color: "text-green-500", status: "First Class" };
    if (percentage >= 70) return { grade: "B+", color: "text-blue-600", status: "Second Class" };
    if (percentage >= 60) return { grade: "B", color: "text-blue-500", status: "Second Class" };
    if (percentage >= 50) return { grade: "C", color: "text-yellow-600", status: "Pass" };
    return { grade: "F", color: "text-red-600", status: "Fail" };
  };

  const handleDownloadMarkscard = () => {
    toast({
      title: "Download Started",
      description: "Your markscard is being generated...",
    });
  };

  const handleLogout = () => {
    setLoggedInStudent(null);
    setLoginData({ usn: "", dob: "" });
  };

  if (loggedInStudent) {
    const totalMarks = calculateTotal(loggedInStudent.marks);
    const percentage = parseFloat(calculatePercentage(loggedInStudent.marks));
    const overallGrade = getOverallGrade(percentage);

    return (
      <div className="min-h-screen bg-gradient-primary">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div className="flex items-center">
              <Button
                onClick={onBack}
                variant="ghost"
                className="text-white hover:bg-white/20 mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Button>
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-white mr-3" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Student Markscard</h1>
                  <p className="text-blue-100">Academic Results Portal</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              Logout
            </Button>
          </div>

          {/* Student Info Card */}
          <Card className="mb-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl animate-slide-in">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-2xl">
                <User className="h-6 w-6 mr-3" />
                {loggedInStudent.name}
              </CardTitle>
              <CardDescription className="text-blue-100 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                USN: {loggedInStudent.usn} | DOB: {loggedInStudent.dob}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Marks Table */}
            <div className="lg:col-span-2">
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl animate-slide-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Subject-wise Marks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-3 px-2 font-semibold text-gray-700">Subject</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Credits</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Marks</th>
                          <th className="text-center py-3 px-2 font-semibold text-gray-700">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((subject, index) => {
                          const marks = loggedInStudent.marks[subject.code as keyof typeof loggedInStudent.marks];
                          const grade = getGrade(marks);
                          return (
                            <tr key={subject.code} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-2">
                                <div>
                                  <div className="font-medium text-gray-800">{subject.code}</div>
                                  <div className="text-sm text-gray-600">{subject.name}</div>
                                </div>
                              </td>
                              <td className="text-center py-4 px-2 text-gray-700">{subject.credits}</td>
                              <td className="text-center py-4 px-2">
                                <span className="font-semibold text-lg text-gray-800">{marks}/100</span>
                              </td>
                              <td className="text-center py-4 px-2">
                                <span className={`font-bold text-lg ${grade.color}`}>{grade.grade}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Card */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl animate-slide-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Overall Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-1">{totalMarks}/500</div>
                      <div className="text-green-100">Total Marks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{percentage}%</div>
                      <div className="text-green-100">Percentage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold mb-1">{overallGrade.grade}</div>
                      <div className="text-green-100">{overallGrade.status}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl animate-slide-in" style={{ animationDelay: '0.6s' }}>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleDownloadMarkscard}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Markscard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <User className="h-8 w-8 text-white mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-white">Student Login</h1>
              <p className="text-blue-100">Enter your credentials to view results</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl animate-slide-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-800">Access Your Results</CardTitle>
              <CardDescription>
                Enter your USN and Date of Birth to view your markscard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="login-usn">University Seat Number (USN)</Label>
                <Input
                  id="login-usn"
                  value={loginData.usn}
                  onChange={(e) => setLoginData({...loginData, usn: e.target.value.toUpperCase()})}
                  placeholder="e.g., 1BM20CS001"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="login-dob">Date of Birth</Label>
                <Input
                  id="login-dob"
                  type="date"
                  value={loginData.dob}
                  onChange={(e) => setLoginData({...loginData, dob: e.target.value})}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3"
              >
                {isLoading ? "Logging in..." : "View Results"}
              </Button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>USN: 1BM20CS001 | DOB: 2002-05-15</div>
                  <div>USN: 1BM20CS002 | DOB: 2002-03-22</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
