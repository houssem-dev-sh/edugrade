import { useState } from 'react';

// Small form helper: errors appear on blur or submit, then update live while the user fixes them.
export default function useForm(initialValues, validators) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const run = (name, vals) => (validators[name] ? validators[name](vals[name] ?? '', vals) : '');

  const setValue = (name, value) => {
    const next = { ...values, [name]: value };
    setValues(next);
    setErrors((prev) => {
      const updated = { ...prev };
      // Re-check every field already flagged (keeps "confirm password" in sync with "password").
      Object.keys(prev).forEach((key) => {
        if (prev[key]) updated[key] = run(key, next);
      });
      return updated;
    });
  };

  const bind = (name) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (e) => setValue(name, e.target.value),
    onBlur: () => {
      if (values[name]) setErrors((prev) => ({ ...prev, [name]: run(name, values) }));
    },
  });

  // Validates everything; focuses the first invalid field of `formEl` if any.
  const validateAll = (formEl) => {
    const next = {};
    Object.keys(validators).forEach((key) => {
      next[key] = run(key, values);
    });
    setErrors(next);
    const firstInvalid = Object.keys(next).find((key) => next[key]);
    if (firstInvalid && formEl) formEl.elements.namedItem(firstInvalid)?.focus();
    return !firstInvalid;
  };

  return { values, setValue, errors, setErrors, bind, validateAll };
}
