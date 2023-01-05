import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

function Form() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const history = useHistory();

  const handleChange = event => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'L\'email est invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function sendEmail(email, name) {
    const mailtoLink = `mailto:${email}?subject=Hello&body=Hi ${name}, how are you?`;
    window.location.href = mailtoLink;
  }

  const handleSubmit = event => {
    event.preventDefault();
    const email = event.target.elements.email.value;
    const name = event.target.elements.name.value;
    sendEmail(email, name);
    if (validate()) {
      history.push('/confirmation', { name: formData.name, email: formData.email });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">Nom :</label>
      <input
        type="text"
        name="name"
        id="name"
        value={formData.name || ''}
        onChange={handleChange}
      />
      {errors.name && <p>{errors.name}</p>}

      <br />

      <label htmlFor="email">Email :</label>
      <input
        type="email"
        name="email"
        id="email"
        value={formData.email || ''}
        onChange={handleChange}
      />
      {errors.email && <p>{errors.email}</p>}

      <br />

      <button type="submit">Soumettre</button>
    </form>
  );
}

export default Form;