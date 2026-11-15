const API_URL = "http://localhost:8089/student/api/students";

// GET all
export const getStudents = () =>
  fetch(API_URL).then(res => res.json());

// CREATE
export const addStudent = (student) =>
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });

// UPDATE
export const updateStudent = (id, student) =>
  fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });

// DELETE
export const deleteStudent = (id) =>
  fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
