function StudentTable({ students, onDelete, onEdit }) {
  return (
    <table border="1" width="100%">
      <thead>
        <tr>
          <th>ID</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Classe</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {students.map((s) => (
          <tr key={s.id}>
            <td>{s.id}</td>
            <td>{s.firstName}</td>
            <td>{s.lastName}</td>
            <td>{s.email}</td>
            <td>{s.phone}</td>
            <td>{s.classe}</td>

            <td>
              <button onClick={() => onEdit(s)}>Edit</button>
              <button onClick={() => onDelete(s.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default StudentTable;
