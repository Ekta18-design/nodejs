const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "crud"
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database.');
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Append the file extension
  }
});
const upload = multer({ storage: storage });

// User Routes
app.post('/users', (req, res) => {
  console.log('Received request body:', req.body);

  const { username, user_firstname, user_lastname, user_email, user_phone, user_password, user_confirmpassword, role, isactive, isdeleted } = req.body;

  if (typeof isactive !== 'boolean' || typeof isdeleted !== 'boolean') {
      res.status(400).json({ error: "Invalid status fields" });
      return;
  }

  const query = `INSERT INTO usermaster (username, user_firstname, user_lastname, user_email, user_phone, user_password, user_confirmpassword, role, isactive, isdeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [username, user_firstname, user_lastname, user_email, user_phone, user_password, user_confirmpassword, role, isactive, isdeleted];

  console.log('Executing query:', query);
  console.log('With values:', values);

  db.query(query, values, (err, result) => {
      if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'Error saving user' });
          return;
      }
      res.status(201).json({ message: 'User saved successfully' });
  });
});

app.get('/users', (req, res) => {
  const query = 'SELECT * FROM usermaster';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).send('Server Error');
    }
    res.send(results);
  });
});

app.get('/users/:userid', (req, res) => {
  const query = 'SELECT * FROM usermaster WHERE userid = ?';
  db.query(query, [req.params.userid], (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

app.put('/users/:userid', (req, res) => {
  const { username, user_firstname, user_lastname, user_email, user_phone, user_password, user_confirmpassword, role, status } = req.body;
  const query = 'UPDATE usermaster SET username = ?, user_firstname = ?, user_lastname = ?, user_email = ?, user_phone = ?, user_password = ?, user_confirmpassword = ?, role = ?, isactive = ?, isdeleted = ? WHERE userid = ?';
  db.query(query, [username, user_firstname, user_lastname, user_email, user_phone, user_password, user_confirmpassword, role, status.isactive?1 : 0, status.isdeleted? 1 :0, req.params.id], (err, result) => {
    if (err) throw err;
    res.send({ ...req.body, userid: req.params.userid });
  });
});

app.delete('/users/:userid', (req, res) => {
  const query = 'DELETE FROM usermaster WHERE userid = ?';
  db.query(query, [req.params.userid], (err, result) => {
    if (err) throw err;
    res.send({ message: 'User deleted' });
  });
});

//Student Route

app.get("/student", (req, res) => {
  const sql = "SELECT * FROM student";
  db.query(sql, (err, data) => {
    if (err) return res.json("Error...");
    return res.json(data);
  });
});

app.post("/student", upload.single('ProfileImage'), (req, res) => {
  const { Name, Email } = req.body;
  const profileImagePath = req.file ? '/uploads/' + req.file.filename : null;
  const sql = "INSERT INTO student (Name, Email, ProfileImage) VALUES (?, ?, ?)";
  db.query(sql, [Name, Email, profileImagePath], (err, result) => {
    if (err) return res.json("Error...");
    const newStudent = { ID: result.insertId, Name, Email, ProfileImage: profileImagePath };
    return res.json(newStudent);
  });
});

app.put("/student/:id", upload.single('ProfileImage'), (req, res) => {
  const studentId = req.params.id;
  const { Name, Email } = req.body;
  const profileImagePath = req.file ? '/uploads/' + req.file.filename : null;

  // Update SQL query based on whether ProfileImage is updated or not
  let sql = "UPDATE student SET Name = ?, Email = ?";
  let params = [Name, Email];

  if (profileImagePath) {
    sql += ", ProfileImage = ?";
    params.push(profileImagePath);
  }

  sql += " WHERE ID = ?";
  params.push(studentId);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error updating student:', err);
      return res.status(500).json({ error: 'Failed to update student' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student updated successfully' });
  });
});

app.delete("/student/:id", (req, res) => {
  const studentId = req.params.id;
  const sql = "DELETE FROM student WHERE ID = ?";
  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error('Error deleting student:', err);
      return res.status(500).json({ error: 'Failed to delete student' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  });
});

app.listen(8081, () => {
  console.log("Listening on port 8081....");
});
