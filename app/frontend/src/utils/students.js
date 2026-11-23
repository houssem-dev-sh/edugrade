// Display helpers for student records.

export function studentName(student) {
  return [student.firstName, student.lastName].filter(Boolean).join(' ') || 'Unnamed student';
}

// "Amira" + "Ben Salah" -> "AB"
export function studentInitials(student) {
  const first = (student.firstName || '').trim().charAt(0);
  const last = (student.lastName || '').trim().charAt(0);
  return first + last;
}

export function formatCount(value) {
  return value.toLocaleString('en-US');
}

// "1 student", "12 students"
export function pluralize(count, singular, plural) {
  return `${formatCount(count)} ${count === 1 ? singular : plural}`;
}

// Groups students by class, largest class first. Students with an empty class are
// counted apart as "unassigned" rather than as a class of their own.
export function summarizeClasses(students) {
  const counts = new Map();
  let unassigned = 0;

  students.forEach((student) => {
    const name = typeof student.classe === 'string' ? student.classe.trim() : '';
    if (!name) {
      unassigned += 1;
      return;
    }
    counts.set(name, (counts.get(name) || 0) + 1);
  });

  const classes = [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return { classes, unassigned };
}
