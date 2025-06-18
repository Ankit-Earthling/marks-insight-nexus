
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Users, BookOpen, Upload, Search, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

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

interface AdminPanelProps {
  onBack: () => void;
  onLogout: () => void;
}

const AdminPanel = ({ onBack, onLogout }: AdminPanelProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState({
    usn: "",
    name: "",
    dob: "",
    marks: { DSA: 0, ADA: 0, DBMS: 0, JAVA: 0, OS: 0 }
  });
  const [searchUsn, setSearchUsn] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const subjects = ["DSA", "ADA", "DBMS", "JAVA", "OS"];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;

      // Fetch marks for all students
      const { data: marksData, error: marksError } = await supabase
        .from('marks')
        .select('*');

      if (marksError) throw marksError;

      // Combine students with their marks
      const studentsWithMarks = studentsData?.map(student => {
        const studentMarks = marksData?.filter(mark => mark.student_id === student.id) || [];
        const marks: any = {};
        
        studentMarks.forEach(mark => {
          marks[mark.subject] = mark.marks;
        });

        return {
          ...student,
          marks
        };
      }) || [];

      setStudents(studentsWithMarks);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch students data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.usn || !newStudent.name || !newStudent.dob) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Insert student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert({
          usn: newStudent.usn,
          name: newStudent.name,
          dob: newStudent.dob
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // Insert marks for each subject
      const marksToInsert = subjects.map(subject => ({
        student_id: studentData.id,
        subject: subject,
        marks: newStudent.marks[subject as keyof typeof newStudent.marks]
      }));

      const { error: marksError } = await supabase
        .from('marks')
        .insert(marksToInsert);

      if (marksError) throw marksError;

      // Reset form
      setNewStudent({
        usn: "",
        name: "",
        dob: "",
        marks: { DSA: 0, ADA: 0, DBMS: 0, JAVA: 0, OS: 0 }
      });

      // Refresh students list
      await fetchStudents();

      toast({
        title: "Success",
        description: "Student added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive"
      });
    }
  };

  const handleMarksUpdate = async (studentId: string, subject: string, marks: number) => {
    try {
      const { error } = await supabase
        .from('marks')
        .upsert({
          student_id: studentId,
          subject: subject,
          marks: marks
        });

      if (error) throw error;

      // Update local state
      setStudents(students.map(student => 
        student.id === studentId 
          ? { ...student, marks: { ...student.marks, [subject]: marks } }
          : student
      ));

      toast({
        title: "Success",
        description: "Marks updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update marks",
        variant: "destructive"
      });
    }
  };

  const filteredStudents = students.filter(student => 
    student.usn.toLowerCase().includes(searchUsn.toLowerCase())
  );

  const calculateTotal = (marks: Student['marks']) => {
    return Object.values(marks).reduce((sum, mark) => sum + (mark || 0), 0);
  };

  const calculatePercentage = (marks: Student['marks']) => {
    const total = calculateTotal(marks);
    return ((total / 500) * 100).toFixed(2);
  };

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
              <BookOpen className="h-8 w-8 text-white mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                <p className="text-blue-100">Manage student marks and data</p>
              </div>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="add-student" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="add-student" className="data-[state=active]:bg-white data-[state=active]:text-blue-900">
              Add Student
            </TabsTrigger>
            <TabsTrigger value="manage-marks" className="data-[state=active]:bg-white data-[state=active]:text-blue-900">
              Manage Marks
            </TabsTrigger>
          </TabsList>

          {/* Add Student Tab */}
          <TabsContent value="add-student">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <Plus className="h-5 w-5 mr-2 text-red-600" />
                  Add New Student
                </CardTitle>
                <CardDescription>
                  Enter student details and marks for all subjects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Student Info */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="usn">USN *</Label>
                    <Input
                      id="usn"
                      value={newStudent.usn}
                      onChange={(e) => setNewStudent({...newStudent, usn: e.target.value.toUpperCase()})}
                      placeholder="e.g., 1BM20CS001"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      placeholder="Student's full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={newStudent.dob}
                      onChange={(e) => setNewStudent({...newStudent, dob: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Marks Section */}
                <div>
                  <Label className="text-lg font-semibold text-gray-700 mb-4 block">
                    Subject Marks (Out of 100)
                  </Label>
                  <div className="grid md:grid-cols-5 gap-4">
                    {subjects.map((subject) => (
                      <div key={subject}>
                        <Label htmlFor={subject} className="text-sm font-medium text-gray-600">
                          {subject}
                        </Label>
                        <Input
                          id={subject}
                          type="number"
                          min="0"
                          max="100"
                          value={newStudent.marks[subject as keyof typeof newStudent.marks]}
                          onChange={(e) => setNewStudent({
                            ...newStudent,
                            marks: {
                              ...newStudent.marks,
                              [subject]: parseInt(e.target.value) || 0
                            }
                          })}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleAddStudent}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Marks Tab */}
          <TabsContent value="manage-marks">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Manage Student Marks ({students.length} students)
                </CardTitle>
                <CardDescription>
                  Search and update marks for existing students
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="flex items-center space-x-2 mb-6">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by USN..."
                    value={searchUsn}
                    onChange={(e) => setSearchUsn(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading students...</div>
                ) : (
                  <div className="space-y-4">
                    {filteredStudents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        {students.length === 0 ? "No students added yet" : "No students found"}
                      </div>
                    ) : (
                      filteredStudents.map((student) => (
                        <Card key={student.id} className="border border-gray-200">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg text-gray-800">{student.name}</CardTitle>
                                <CardDescription>USN: {student.usn} | DOB: {student.dob}</CardDescription>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">
                                  {calculateTotal(student.marks)}/500
                                </div>
                                <div className="text-sm text-gray-500">
                                  {calculatePercentage(student.marks)}%
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-5 gap-3">
                              {subjects.map((subject) => (
                                <div key={subject}>
                                  <Label className="text-xs text-gray-600">{subject}</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={student.marks[subject as keyof typeof student.marks] || 0}
                                    onChange={(e) => handleMarksUpdate(
                                      student.id, 
                                      subject, 
                                      parseInt(e.target.value) || 0
                                    )}
                                    className="mt-1 text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
