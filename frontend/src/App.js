import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

const App = () => {
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null); // State to keep track of the student being edited
  const fileInputRef = useRef(null); // Ref for file input

  useEffect(() => {
    fetch('http://localhost:8081/student')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setData(data);
      })
      .catch(err => console.error('Fetch error:', err));
  }, []);

  const handleEdit = (student) => {
    setEditing(student); // Set the student to be edited
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:8081/student/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then(() => {
      setData(data.filter(student => student.ID !== id));
    })
    .catch(err => console.error('Fetch error:', err));
  };

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    const formData = new FormData();
    formData.append('Name', values.Name);
    formData.append('Email', values.Email);
    formData.append('Password', values.Password); // Send Password
    formData.append('IsActive', values.IsActive);
    formData.append('IsDeleted', values.IsDeleted);
    if (values.ProfileImage) {
      formData.append('ProfileImage', values.ProfileImage);
    }
  
    if (editing) {
      // Update existing student
      fetch(`http://localhost:8081/student/${editing.ID}`, {
        method: 'PUT',
        body: formData
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(() => {
        setData(data.map(student => 
          student.ID === editing.ID 
            ? { ...student, Name: values.Name, Email: values.Email, Password: values.Password, ProfileImage: values.ProfileImage ? '/uploads/' + values.ProfileImage.name : student.ProfileImage, IsActive: values.IsActive, IsDeleted: values.IsDeleted } 
            : student
        ));
        setEditing(null);
        resetForm();
        if (fileInputRef.current) {
          fileInputRef.current.value = null; // Clear file input value
        }
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => {
        setSubmitting(false);
      });
    } 
    else {
      // Add new student
      fetch('http://localhost:8081/student', {
        method: 'POST',
        body: formData
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(newData => {
        setData([...data, newData]);
        resetForm();
        if (fileInputRef.current) {
          fileInputRef.current.value = null; // Clear file input value
        }
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => {
        setSubmitting(false);
      });
    }
  };
  
  const validationSchema = Yup.object({
    Name: Yup.string()
      .required('Name is required'),
    Email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
      Password: Yup.string()
      .required('Password is required'),
    ConfirmPassword: Yup.string()
      .oneOf([Yup.ref('Password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
    ProfileImage: Yup.mixed()
      .notRequired(), // Profile image is not required for update
      IsActive: Yup.boolean(),
      IsDeleted: Yup.boolean()
  });

  return (
    <div>
      <h1>{editing ? 'Edit Student' : 'Add New Student'}</h1>
      <Formik
        initialValues={{ 
          Name: editing ? editing.Name : '', 
          Email: editing ? editing.Email : '',
          Password: '', 
          ConfirmPassword: '',  
          ProfileImage: null ,
          IsActive: editing ? editing.IsActive : true, 
          IsDeleted: editing ? editing.IsDeleted : false 
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <div>
              <label htmlFor="Name">Name</label>
              <Field name="Name" type="text" />
              <ErrorMessage name="Name" component="div" />
            </div>
            <div>
              <label htmlFor="Email">Email</label>
              <Field name="Email" type="email" />
              <ErrorMessage name="Email" component="div" />
            </div>
            <div>
              <label htmlFor="Password">Password</label>
              <Field name="Password" type="password" />
              <ErrorMessage name="Password" component="div" />
            </div>
            <div>
              <label htmlFor="ConfirmPassword">Confirm Password</label>
              <Field name="ConfirmPassword" type="password" />
              <ErrorMessage name="ConfirmPassword" component="div" />
            </div>
            
            <div>
              <label htmlFor="ProfileImage">Profile Image</label>
              <input id="ProfileImage" name="ProfileImage" type="file"
                ref={fileInputRef} // Attach ref to the file input
                onChange={(event) => {
                  setFieldValue("ProfileImage", event.currentTarget.files[0]);
                }}
              /> 
               <ErrorMessage name="ProfileImage" component="div" />
            </div>
            <div>
              <label htmlFor="IsActive">Is Active</label>
              <Field name="IsActive" type="checkbox" />
              <ErrorMessage name="IsActive" component="div" />
            </div>
            <div>
              <label htmlFor="IsDeleted">Is Deleted</label>
              <Field name="IsDeleted" type="checkbox" />
              <ErrorMessage name="IsDeleted" component="div" />
            </div>
            <button type="submit" disabled={isSubmitting}>
              {editing ? 'Update' : 'Submit'}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            )}
          </Form>
        )}
      </Formik>

      <h1>Student List</h1>
      {data.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Profile Image</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.ID}>
                <td>{d.ID}</td>
                <td>{d.Name}</td>
                <td>{d.Email}</td>
                <td>
                  {d.ProfileImage && (
                    <img src={`http://localhost:8081${d.ProfileImage}`} alt={d.Name} width="50" />
                  )}
                </td>
                <td>
                  {d.IsActive ? 'Active' : 'Inactive'}, {d.IsDeleted ? 'Deleted' : 'Not Deleted'}
                </td>
                <td>
                  <button onClick={() => handleEdit(d)}>Edit</button>
                  <button onClick={() => handleDelete(d.ID)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data found</p>
      )}
       {/* Add a navigation link */}
       <Link to="/user-master">Go to User Master</Link>
    </div>
  );
}

export default App;
