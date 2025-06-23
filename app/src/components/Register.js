import React, { useState } from 'react';
import { Alert, Button, Card, SelectField, TextField } from '@aws-amplify/ui-react';
import { useForm } from 'react-hook-form';

export default function Register({ userData }) {
  const [status, setStatus] = useState({});
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_API_URL}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userData.token.toString()}`,
        },
        body: JSON.stringify({
          email: data.email,
          role: data.role,
          name: data.name,
        }),
        // …
      });
      if (response.status === 201) {
        reset();
        setStatus({ variation: 'success', message: 'User Created!' });
      }
    } catch (error) {
      setStatus({ variation: 'error', message: error.message });
    }
  };
  return (
    <Card>
      {status?.variation && (
        <Alert id="alert" variation={status.variation} style={{ marginBottom: '20px' }}>
          {status.message}
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          style={{ marginBottom: '20px' }}
          placeholder="test@test.com"
          label="Email"
          type="email"
          errorMessage="Email is required"
          required
          {...register('email')}
        />
        <TextField
          style={{ marginBottom: '20px' }}
          placeholder="John Doe"
          label="Full Name"
          required
          errorMessage="Name is required"
          {...register('name')}
        />
        <SelectField style={{ marginBottom: '20px' }} label="Role" {...register('role')}>
          <option value="contributor">Contributor</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </SelectField>
        <Button type="submit">Register</Button>
      </form>
    </Card>
  );
}
