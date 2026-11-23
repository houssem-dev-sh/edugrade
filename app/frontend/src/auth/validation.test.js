import { isValidEmail, validateEmail } from './validation';

describe('isValidEmail', () => {
  test.each(['name@school.edu', 'a.b@c.d', 'x@sub.domain.org', 'a@b.c.'])('accepts %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  test.each(['', 'name', '@school.edu', 'name@', 'name@school', 'name@.edu', 'name@school.',
    'a@b@c.d', 'na me@school.edu', 'name@school.edu ', null, undefined])('rejects %p', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });

  test('stays fast on long hostile input', () => {
    const start = Date.now();
    isValidEmail(`a@${'a.'.repeat(50000)}!`);
    expect(Date.now() - start).toBeLessThan(100);
  });
});

describe('validateEmail', () => {
  test('trims before checking', () => {
    expect(validateEmail('  name@school.edu  ')).toBe('');
  });

  test('asks for an email when empty', () => {
    expect(validateEmail('   ')).toBe('Enter your email address.');
  });
});
