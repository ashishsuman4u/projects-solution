import React, { useState } from 'react';
import { Alert, Button, Card, TextAreaField, TextField } from '@aws-amplify/ui-react';
import { useForm } from 'react-hook-form';

export default function Projects({ userData }) {
  const [status, setStatus] = useState({});
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_API_URL}/project`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userData.token.toString()}`,
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
        }),
        // …
      });
      if (response.status === 201) {
        reset();
        setStatus({ variation: 'success', message: 'Project Created!' });
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
          placeholder="Project Name"
          label="Name"
          errorMessage="Project Name is required"
          required
          {...register('name')}
        />
        <TextAreaField
          style={{ marginBottom: '20px' }}
          label="Description"
          name="description"
          placeholder="Explain the project"
          rows={3}
          required
          {...register('description')}
        />
        <Button type="submit">Create Project</Button>
      </form>
    </Card>
  );
}
