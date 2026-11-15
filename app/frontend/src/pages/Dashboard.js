import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  TextField,
} from "@mui/material";

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    classe: "",
  });

  // ================= LOAD =================
  const loadStudents = () => {
    fetch("/student/api/students")
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.log("LOAD ERROR:", err));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // ================= DELETE =================
  const deleteStudent = (id) => {
    fetch(`/student/api/students/${id}`, {
      method: "DELETE",
    })
      .then(() => loadStudents())
      .catch((err) => console.log("DELETE ERROR:", err));
  };

  // ================= EDIT =================
  const editStudent = (student) => {
    setForm({
      id: student.id,
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      email: student.email || "",
      phone: student.phone || "",
      classe: student.classe || "",
    });
  };

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    if (!form.firstName || !form.lastName || !form.email) {
      alert("First name, last name and email are required");
      return false;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(form.email)) {
      alert("Invalid email format");
      return false;
    }

    const phoneRegex = /^[0-9]{8,15}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      alert("Invalid phone number");
      return false;
    }

    return true;
  };

  // ================= ADD / UPDATE =================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const isEdit = form.id !== null;

    const url = isEdit
      ? `/student/api/students/${form.id}`
      : "/student/api/students";

    const method = isEdit ? "PUT" : "POST";

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      classe: form.classe,
    };

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(() => {
        loadStudents();

        setForm({
          id: null,
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          classe: "",
        });
      })
      .catch((err) => console.log("SAVE ERROR:", err));
  };

  // ================= FILTER =================
  const filteredStudents = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Box sx={{ padding: 3 }}>

      {/* ================= TITLE ================= */}
      <Typography variant="h4" mb={2}>
        Students Dashboard
      </Typography>

      {/* ================= STATS CARDS ================= */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Paper sx={{ padding: 2, flex: 1 }}>
          <h3>Total Students</h3>
          <h2>{students.length}</h2>
        </Paper>

        <Paper sx={{ padding: 2, flex: 1 }}>
          <h3>Classes</h3>
          <h2>
            {[...new Set(students.map((s) => s.classe))].length}
          </h2>
        </Paper>
      </Box>

      {/* ================= SEARCH ================= */}
      <TextField
        label="Search student..."
        fullWidth
        sx={{ mb: 2 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= FORM ================= */}
      <Paper sx={{ padding: 2, marginBottom: 3 }}>
        <Typography variant="h6">
          {form.id ? "Update Student" : "Add Student"}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}
        >
          <TextField
            name="firstName"
            label="First Name"
            value={form.firstName}
            onChange={handleChange}
          />

          <TextField
            name="lastName"
            label="Last Name"
            value={form.lastName}
            onChange={handleChange}
          />

          <TextField
            name="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
          />

          <TextField
            name="phone"
            label="Phone"
            value={form.phone}
            onChange={handleChange}
          />

          <TextField
            name="classe"
            label="Classe"
            value={form.classe}
            onChange={handleChange}
          />

          <Button type="submit" variant="contained" color="success">
            {form.id ? "Update" : "Add"}
          </Button>

          {form.id && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() =>
                setForm({
                  id: null,
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  classe: "",
                })
              }
            >
              Cancel
            </Button>
          )}
        </Box>
      </Paper>

      {/* ================= TABLE ================= */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Classe</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredStudents.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>{s.firstName}</TableCell>
                <TableCell>{s.lastName}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>{s.classe}</TableCell>

                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => editStudent(s)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => deleteStudent(s.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
}

export default Dashboard;
