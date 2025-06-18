import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Calendar, GraduationCap, Download, Star, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';

interface Student {
  id: string;
  usn: string;
  name: string;
  dob: string;
  marks: {
    DSA?: number;
    ADA?: number;
    DBMS?: number;
    JAVA?: number;
    OS?: number;
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

    try {
      // Find student by USN and DOB
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('usn', loginData.usn.toUpperCase())
        .eq('dob', loginData.dob)
        .single();

      if (studentError || !studentData) {
        toast({
          title: "Login Failed",
          description: "Invalid USN or Date of Birth",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Fetch marks for this student
      const { data: marksData, error: marksError } = await supabase
        .from('marks')
        .select('*')
        .eq('student_id', studentData.id);

      if (marksError) {
        toast({
          title: "Error",
          description: "Failed to fetch marks data",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Combine student data with marks
      const marks: any = {};
      marksData?.forEach(mark => {
        marks[mark.subject] = mark.marks;
      });

      const student: Student = {
        ...studentData,
        marks
      };

      setLoggedInStudent(student);
      toast({
        title: "Login Successful",
        description: `Welcome, ${student.name}!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const calculateTotal = (marks: Student['marks']) => {
    return Object.values(marks).reduce((sum, mark) => sum + (mark || 0), 0);
  };

  const calculateGPA = (marks: Student['marks']) => {
    const totalMarks = calculateTotal(marks);
    const percentage = (totalMarks / 500) * 100;
    
    // Convert percentage to 4.0 GPA scale
    if (percentage >= 97) return 4.0;
    if (percentage >= 93) return 3.9;
    if (percentage >= 90) return 3.8;
    if (percentage >= 87) return 3.7;
    if (percentage >= 83) return 3.6;
    if (percentage >= 80) return 3.5;
    if (percentage >= 77) return 3.4;
    if (percentage >= 73) return 3.3;
    if (percentage >= 70) return 3.2;
    if (percentage >= 67) return 3.1;
    if (percentage >= 65) return 3.0;
    if (percentage >= 62) return 2.9;
    if (percentage >= 60) return 2.8;
    if (percentage >= 57) return 2.7;
    if (percentage >= 55) return 2.6;
    if (percentage >= 52) return 2.5;
    if (percentage >= 50) return 2.4;
    if (percentage >= 47) return 2.3;
    if (percentage >= 45) return 2.2;
    if (percentage >= 42) return 2.1;
    if (percentage >= 40) return 2.0;
    if (percentage >= 37) return 1.9;
    if (percentage >= 35) return 1.8;
    if (percentage >= 32) return 1.7;
    if (percentage >= 30) return 1.6;
    if (percentage >= 27) return 1.5;
    if (percentage >= 25) return 1.4;
    if (percentage >= 22) return 1.3;
    if (percentage >= 20) return 1.2;
    if (percentage >= 17) return 1.1;
    if (percentage >= 15) return 1.0;
    return 0.0;
  };

  const getGrade = (marks: number) => {
    if (marks >= 90) return { grade: "A+", color: "text-green-600" };
    if (marks >= 80) return { grade: "A", color: "text-green-500" };
    if (marks >= 70) return { grade: "B+", color: "text-blue-600" };
    if (marks >= 60) return { grade: "B", color: "text-blue-500" };
    if (marks >= 50) return { grade: "C", color: "text-yellow-600" };
    return { grade: "F", color: "text-red-600" };
  };

  const getOverallGrade = (gpa: number) => {
    if (gpa >= 3.8) return { grade: "A+", color: "text-green-600", status: "Distinction" };
    if (gpa >= 3.5) return { grade: "A", color: "text-green-500", status: "First Class" };
    if (gpa >= 3.0) return { grade: "B+", color: "text-blue-600", status: "Second Class" };
    if (gpa >= 2.5) return { grade: "B", color: "text-blue-500", status: "Second Class" };
    if (gpa >= 2.0) return { grade: "C", color: "text-yellow-600", status: "Pass" };
    return { grade: "F", color: "text-red-600", status: "Fail" };
  };

  const generatePDF = (student: Student) => {
    const doc = new jsPDF();
    const totalMarks = calculateTotal(student.marks);
    const gpa = calculateGPA(student.marks);
    const overallGrade = getOverallGrade(gpa);

    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('BMS Institute of Technology and Management', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Student Markscard', 105, 30, { align: 'center' });
    
    // Student Info
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Student Name: ${student.name}`, 20, 50);
    doc.text(`USN: ${student.usn}`, 20, 60);
    doc.text(`Date of Birth: ${student.dob}`, 20, 70);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 140, 50);

    // Table Header
    doc.setFont(undefined, 'bold');
    doc.text('Subject Code', 20, 90);
    doc.text('Subject Name', 60, 90);
    doc.text('Credits', 130, 90);
    doc.text('Marks', 150, 90);
    doc.text('Grade', 170, 90);

    // Draw line under header
    doc.line(20, 92, 190, 92);

    // Table Content
    doc.setFont(undefined, 'normal');
    let yPos = 100;
    
    subjects.forEach((subject) => {
      const marks = student.marks[subject.code as keyof typeof student.marks] || 0;
      const grade = getGrade(marks);
      
      doc.text(subject.code, 20, yPos);
      doc.text(subject.name, 60, yPos);
      doc.text(subject.credits.toString(), 130, yPos);
      doc.text(`${marks}/100`, 150, yPos);
      doc.text(grade.grade, 170, yPos);
      
      yPos += 10;
    });

    // Summary
    yPos += 10;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text('SUMMARY', 20, yPos);
    yPos += 10;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Total Marks: ${totalMarks}/500`, 20, yPos);
    yPos += 8;
    doc.text(`GPA: ${gpa.toFixed(2)}/4.0`, 20, yPos);
    yPos += 8;
    doc.text(`Overall Grade: ${overallGrade.grade}`, 20, yPos);
    yPos += 8;
    doc.text(`Status: ${overallGrade.status}`, 20, yPos);

    // Footer
    doc.setFontSize(10);
    doc.text('This is a computer generated markscard', 105, 280, { align: 'center' });

    // Save the PDF
    doc.save(`${student.usn}_markscard.pdf`);
  };

  const handleDownloadMarkscard = () => {
    if (loggedInStudent) {
      generatePDF(loggedInStudent);
      toast({
        title: "Download Complete",
        description: "Your markscard has been downloaded successfully!",
      });
    }
  };

  const handleLogout = () => {
    setLoggedInStudent(null);
    setLoginData({ usn: "", dob: "" });
  };

  if (loggedInStudent) {
    const totalMarks = calculateTotal(loggedInStudent.marks);
    const gpa = calculateGPA(loggedInStudent.marks);
    const overallGrade = getOverallGrade(gpa);

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
                      <div className="text-2xl font-bold mb-1">{gpa.toFixed(2)}/4.0</div>
                      <div className="text-green-100">GPA</div>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
