import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link } from 'react-router-dom';

const validationSchema = Yup.object({
  username: Yup.string().required('UserName is required'),
  user_firstname: Yup.string().required('FirstName is required'),
  user_lastname: Yup.string().required('LastName is required'),
  user_phone: Yup.string().required('Phone is required'),
  user_email: Yup.string().email('Invalid email address').required('Email is required'),
  user_password: Yup.string().required('Password is required'),
  user_confirmpassword: Yup.string()
    .oneOf([Yup.ref('user_password')], 'Passwords must match')
    .required('Confirm Password is required'),
  role: Yup.string().required('Role selection is required'),
  isactive: Yup.boolean().required('Please select active status'),
  isdeleted: Yup.boolean().required('Please select delete status'),
});

const UserMaster = () => {
  const [userIdCounter, setUserIdCounter] = useState(1);
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8081/users')
      .then(response => {
        const users = response.data;
        setUsers(users);
        const lastUserId = users.reduce((maxId, user) => Math.max(maxId, user.userid), 0);
        setUserIdCounter(lastUserId + 1);
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const handleSubmit = (values, { resetForm }) => {
    if (editUser) {
      axios.put(`http://localhost:8081/users/${editUser.userid}`, values)
        .then(response => {
          // Refetch users from the backend
          axios.get('http://localhost:8081/users')
            .then(response => {
              setUsers(response.data);
              setEditUser(null);
              resetForm();
              alert('Updated Data Successfully!');
            })
            .catch(error => console.error('Error fetching users:', error));
        })
        .catch(error => console.error('Error updating user:', error));
    } else {
      values.userid = userIdCounter;
      axios.post('http://localhost:8081/users', values)
        .then(response => {
          // Refetch users from the backend
          axios.get('http://localhost:8081/users')
            .then(response => {
              setUsers(response.data);
              setUserIdCounter(userIdCounter + 1);
              resetForm();
              alert('Added Data Successfully!');
            })
            .catch(error => console.error('Error fetching users:', error));
        })
        .catch(error => console.error('Error saving user:', error));
    }
  };
  
  const handleEdit = (user) => {
    console.log('Editing user:', user); // Debugging statement
    setEditUser(user);
  };

  const handleDelete = (userId) => {
    axios.delete(`http://localhost:8081/users/${userId}`)
      .then(() => {
        setUsers(users.filter(user => user.userid !== userId));
        alert('Deleted Data Successfully!');
      })
      .catch(error => console.error('Error deleting user:', error));
  };

  const initialValues = editUser || {
    userid: 0,
    username: '',
    user_firstname: '',
    user_lastname: '',
    user_email: '',
    user_phone: '',
    user_password: '',
    user_confirmpassword: '',
    role: '',
    isactive: false,
    isdeleted: false,
  };

  return (
    <>
      <div className='card'>
        <div className='card-body'>
          <div className='d-flex flex-wrap flex-sm-nowrap'>
            <div className='flex-grow-1'>
              <div className='d-flex justify-content-between align-items-start flex-wrap'>
                <div className='d-flex flex-column flex-column-fluid'>
                  <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ isSubmitting, setFieldValue }) => (
                      <Form>
                        <div className='flex-lg-row-fluid me-0'>
                          <div className="row mb-5">
                            <div className="col-md-6 fv-row">
                              <label className="fs-5 fw-semibold mb-2">User Id</label>
                              <Field type="text" id="userid" className="form-control form-control-solid" name="userid" readOnly />
                              <ErrorMessage name="userid" component="div" className="error" />
                            </div>
                            <div className="col-md-6 fv-row">
                              <label className="fs-5 fw-semibold mb-2">User Name</label>
                              <Field type="text" id="username" className="form-control form-control-solid" name="username" />
                              <ErrorMessage name="username" component="div" className="error" />
                            </div>
                          </div>

                          <div className="row mb-5">
                            <div className="col-md-6 fv-row">
                              <label className="fs-5 fw-semibold mb-2">First Name</label>
                              <Field type="text" id="user_firstname" className="form-control form-control-solid" name="user_firstname" />
                              <ErrorMessage name="user_firstname" component="div" className="error" />
                            </div>
                            <div className="col-md-6 fv-row">
                              <label className="fs-5 fw-semibold mb-2">Last Name</label>
                              <Field type="text" id="user_lastname" className="form-control form-control-solid" name="user_lastname" />
                              <ErrorMessage name="user_lastname" component="div" className="error" />
                            </div>
                          </div>
                          <div className="row mb-5">
                            <div className="col-md-6 fv-row">
                              <label className="fs-5 fw-semibold mb-2">Email</label>
                              <Field type="text" id="user_email" className="form-control form-control-solid" name="user_email" />
                              <ErrorMessage name="user_email" component="div" className="error" />
                            </div>
                            <div className="col-md-6 fv-row">
                              <label className="fs-5 fw-semibold mb-2">Phone</label>
                              <Field type="text" id="user_phone" className="form-control form-control-solid" name="user_phone" />
                              <ErrorMessage name="user_phone" component="div" className="error" />
                            </div>
                          </div>
                          <div className="row mb-5">
                            <div className="col-md-6 fv-row">
                              <label className="fs-5 fw-semibold mb-2">Password</label>
                              <Field type="password" id="user_password" className="form-control form-control-solid" name="user_password" />
                              <ErrorMessage name="user_password" component="div" className="error" />
                            </div>
                            <div className="col-md-6 fv-row">
                              <label className="fs-5 fw-semibold mb-2">Confirm Password</label>
                              <Field type="password" id="user_confirmpassword" className="form-control form-control-solid" name="user_confirmpassword" />
                              <ErrorMessage name="user_confirmpassword" component="div" className="error" />
                            </div>
                          </div>
                          <div className="row mb-5">
                            <div className="col-md-6 fv-row">
                              <label className="fs-5 fw-semibold mb-2">Role</label>
                              <Field as="select" className="form-control form-control-solid" id="role" name="role">
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                              </Field>
                              <ErrorMessage name="role" component="div" className="error" />
                            </div>
                          </div>
                          <div className="row mb-5">
                            <div className="col-md-6 fv-row">
                              <label className="fs-5 fw-semibold mb-2">isActive</label>
                              <div className="form-check form-check-solid form-switch form-check-custom fv-row">
                                <Field className="form-check-input w-45px h-30px" type="checkbox" id="isactive" name="isactive" />
                              </div>
                              <ErrorMessage name="isactive" component="div" className="error" />
                            </div>
                            <div className="col-md-6 fv-row">
                              <label className="fs-5 fw-semibold mb-2">isDeleted</label>
                              <div className="form-check form-check-solid form-switch form-check-custom fv-row">
                                <Field className="form-check-input w-45px h-30px" type="checkbox" id="isdeleted" name="isdeleted" />
                              </div>
                              <ErrorMessage name="isdeleted" component="div" className="error" />
                            </div>
                          </div>
                          <div className="separator mb-8"></div>
                          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Save</button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">User List</h5>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Active</th>
                <th>Deleted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.userid}>
                  <td>{user.userid}</td>
                  <td>{user.username}</td>
                  <td>{user.user_firstname}</td>
                  <td>{user.user_lastname}</td>
                  <td>{user.user_email}</td>
                  <td>{user.user_phone}</td>
                  <td>{user.role}</td>
                  <td>{user.isactive ? 'Yes' : 'No'}</td>
                  <td>{user.isdeleted ? 'Yes' : 'No'}</td>
                  <td>
                    <button onClick={() => handleEdit(user)} className="btn btn-warning btn-sm me-2">Edit</button>
                    <button onClick={() => handleDelete(user.userid)} className="btn btn-danger btn-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Link to="/">Go to Student List</Link>
    </>
  );
};

export default UserMaster;
