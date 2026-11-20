import { useState } from "react";

function AddStudent({ refresh }) {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");

  const add = () => {
    fetch("/student/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: first,
        last_name: last,
      }),
    }).then(() => refresh());
  };

  return (
    <div>
      <input placeholder="First name" onChange={(e) => setFirst(e.target.value)} />
      <input placeholder="Last name" onChange={(e) => setLast(e.target.value)} />
      <button onClick={add}>Add Student</button>
    </div>
  );
}

export default AddStudent;
