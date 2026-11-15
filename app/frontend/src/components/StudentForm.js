import { useEffect, useState } from "react";

function StudentForm({ onSave, selectedStudent }) {
  const [student, setStudent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    classe: "",
  });

  useEffect(() => {
    if (selectedStudent) {
      setStudent(selectedStudent);
    }
  }, [selectedStudent]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(student);
    setStudent({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      classe: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" placeholder="First Name" value={student.firstName} onChange={handleChange} />
      <input name="lastName" placeholder="Last Name" value={student.lastName} onChange={handleChange} />
      <input name="email" placeholder="Email" value={student.email} onChange={handleChange} />
      <input name="phone" placeholder="Phone" value={student.phone} onChange={handleChange} />
      <input name="classe" placeholder="Classe" value={student.classe} onChange={handleChange} />

      <button type="submit">
        {student.id ? "Update" : "Add"}
      </button>
    </form>
  );
}

export default StudentForm;y
