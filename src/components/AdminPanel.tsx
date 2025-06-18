
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    usn: "",
    name: "",
    dob: "",
    marks: {
      DSA: 0,
      ADA: 0,
      DBMS: 0,
      JAVA: 0,
      OS: 0
    }
  });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const subjects = ["DSA", "ADA", "DBMS", "JAVA", "OS"] as const;

  const loadStudents = async () => {
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('usn');

      if (studentsError) {
        toast({
          title: "Error",
          description: "Failed to load students",
          variant: "destructive"
        });
        return;
      }

      const studentsWithMarks = await Promise.all(
        (studentsData || []).map(async (student) => {
          const { data: marksData } = await supabase
            .from('marks')
            .select('*')
            .eq('student_id', student.id);

          const marks: any = {};
          marksData?.forEach(mark => {
            marks[mark.subject] = mark.marks;
          });

          return { ...student, marks };
        })
      );

      setStudents(studentsWithMarks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    }
  };

  React.useEffect(() => {
    loadStudents();
  }, []);

  const handleSubmit = async () => {
    if (!formData.usn || !formData.name || !formData.dob) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (editingStudent) {
        // Update existing student
        const { error: studentError } = await supabase
          .from('students')
          .update({
            usn: formData.usn.toUpperCase(),
            name: formData.name,
            dob: formData.dob
          })
          .eq('id', editingStudent.id);

        if (studentError) {
          toast({
            title: "Error",
            description: "Failed to update student",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        // Update marks
        for (const subject of subjects) {
          const { error: markError } = await supabase
            .from('marks')
            .upsert({
              student_id: editingStudent.id,
              subject: subject as "DSA" | "ADA" | "DBMS" | "JAVA" | "OS",
              marks: formData.marks[subject]
            });

          if (markError) {
            toast({
              title: "Error",
              description: `Failed to update marks for ${subject}`,
              variant: "destructive"
            });
          }
        }

        toast({
          title: "Success",
          description: "Student updated successfully",
        });
      } else {
        // Create new student
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .insert({
            usn: formData.usn.toUpperCase(),
            name: formData.name,
            dob: formData.dob
          })
          .select()
          .single();

        if (studentError) {
          toast({
            title: "Error",
            description: "Failed to create student",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        // Insert marks for all subjects
        const marksData = subjects.map(subject => ({
          student_id: studentData.id,
          subject: subject as "DSA" | "ADA" | "DBMS" | "JAVA" | "OS",
          marks: formData.marks[subject]
        }));

        const { error: marksError } = await supabase
          .from('marks')
          .insert(marksData);

        if (marksError) {
          toast({
            title: "Error",
            description: "Failed to save marks",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        toast({
          title: "Success",
          description: "Student added successfully",
        });
      }

      // Reset form and reload students
      setFormData({
        usn: "",
        name: "",
        dob: "",
        marks: { DSA: 0, ADA: 0, DBMS: 0, JAVA: 0, OS: 0 }
      });
      setEditingStudent(null);
      loadStudents();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      usn: student.usn,
      name: student.name,
      dob: student.dob,
      marks: {
        DSA: student.marks.DSA || 0,
        ADA: student.marks.ADA || 0,
        DBMS: student.marks.DBMS || 0,
        JAVA: student.marks.JAVA || 0,
        OS: student.marks.OS || 0
      }
    });
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete student",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Student deleted successfully",
      });

      loadStudents();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive"
      });
    }
  };

  const calculateTotal = (marks: Student['marks']) => {
    return Object.values(marks).reduce((sum, mark) => sum + (mark || 0), 0);
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
            <Users className="h-8 w-8 text-white mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-blue-100">Manage student records and marks</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Student Form */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl animate-slide-in">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Plus className="h-5 w-5 mr-2" />
                {editingStudent ? "Edit Student" : "Add New Student"}
              </CardTitle>
              <CardDescription>
                {editingStudent ? "Update student information and marks" : "Enter student details and marks for all subjects"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usn">University Seat Number (USN)</Label>
                  <Input
                    id="usn"
                    value={formData.usn}
                    onChange={(e) => setFormData({...formData, usn: e.target.value.toUpperCase()})}
                    placeholder="e.g., 1BM20CS001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter student's full name"
                />
              </div>

              <div>
                <Label>Marks (out of 100)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {subjects.map((subject) => (
                    <div key={subject}>
                      <Label htmlFor={subject} className="text-sm">{subject}</Label>
                      <Input
                        id={subject}
                        type="number"
                        min="0"
                        max="100"
                        value={formData.marks[subject]}
                        onChange={(e) => setFormData({
                          ...formData,
                          marks: { ...formData.marks, [subject]: parseInt(e.target.value) || 0 }
                        })}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  {isLoading ? "Saving..." : editingStudent ? "Update Student" : "Add Student"}
                </Button>
                
                {editingStudent && (
                  <Button
                    onClick={() => {
                      setEditingStudent(null);
                      setFormData({
                        usn: "",
                        name: "",
                        dob: "",
                        marks: { DSA: 0, ADA: 0, DBMS: 0, JAVA: 0, OS: 0 }
                      });
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-gray-800">Registered Students</CardTitle>
              <CardDescription>View and manage all student records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No students registered yet.</p>
                ) : (
                  students.map((student) => (
                    <div key={student.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{student.name}</h4>
                          <p className="text-sm text-gray-600">{student.usn}</p>
                          <p className="text-sm text-gray-600">DOB: {student.dob}</p>
                          <p className="text-sm text-gray-600">
                            Total: {calculateTotal(student.marks)}/500
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(student)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(student.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
