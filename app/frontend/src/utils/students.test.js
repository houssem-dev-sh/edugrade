import { pluralize, studentInitials, studentName, summarizeClasses } from './students';

describe('studentName', () => {
  test('joins first and last name', () => {
    expect(studentName({ firstName: 'Amira', lastName: 'Ben Salah' })).toBe('Amira Ben Salah');
  });

  test('copes with missing parts', () => {
    expect(studentName({ firstName: 'Amira', lastName: null })).toBe('Amira');
    expect(studentName({})).toBe('Unnamed student');
  });
});

describe('studentInitials', () => {
  test('takes the first letter of the first and last name', () => {
    expect(studentInitials({ firstName: 'Amira', lastName: 'Ben Salah' })).toBe('AB');
    expect(studentInitials({ firstName: ' youssef', lastName: 'Karray' })).toBe('yK');
  });

  test('returns an empty string when there is no name', () => {
    expect(studentInitials({})).toBe('');
  });
});

describe('pluralize', () => {
  test('picks the right form and groups thousands', () => {
    expect(pluralize(1, 'student', 'students')).toBe('1 student');
    expect(pluralize(0, 'student', 'students')).toBe('0 students');
    expect(pluralize(1284, 'student', 'students')).toBe('1,284 students');
  });
});

describe('summarizeClasses', () => {
  const students = [
    { classe: '3A' },
    { classe: '4SE2' },
    { classe: '3A' },
    { classe: '2B' },
    { classe: '' },
    { classe: null },
    { classe: ' 3A ' },
    {},
  ];

  test('counts students per class, largest first, then A to Z', () => {
    expect(summarizeClasses(students).classes).toEqual([
      { name: '3A', count: 3 },
      { name: '2B', count: 1 },
      { name: '4SE2', count: 1 },
    ]);
  });

  test('students without a class are counted apart, not as a class', () => {
    expect(summarizeClasses(students).unassigned).toBe(3);
  });

  test('handles an empty list', () => {
    expect(summarizeClasses([])).toEqual({ classes: [], unassigned: 0 });
  });
});
