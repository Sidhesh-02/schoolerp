# Student ERP System

![ERP Logo](C:\Users\Lenovo\Downloads\Screenshot 2024-06-28 224156.png)

## Description

The Student ERP (Enterprise Resource Planning) System is designed to streamline various administrative tasks in educational institutions. This system manages student profiles, attendance, fees, hostel accommodations, and academic performance.

## Features

1. **Reports**:
![Screenshot 2024-06-28 224156](https://github.com/Aryanryn09/schoolerp/assets/105795148/2caf9c73-333d-4b5b-9ebc-f2db337b1e74)


- **Total Students**: Displays the total number of students.
- **Absent Students**: Shows the count of students who are absent.
- **Total Money Collected**: Summarizes the total fees collected.
- **Students Yet to Pay Fees**: Lists students who have pending fees.
- **Total Beds Remaining**: Indicates the number of available hostel beds.

2. **Student Management**:

   - **Upload Student Details**: Allows bulk upload of student information.
   - **Create Student Profile**: Facilitates the creation of individual student profiles.

3. **Attendance System**:

   - **Global Attendance**: Mark attendance for all students in a class.
   - **Absent Students**: View and manage absent students.

4. **Fee Management**:

   - **Show Fee Details**: Displays detailed fee information for each student.
   - **Pending Fees**: Lists students with outstanding fees.

5. **Hostel Management**:

   - **Available Beds**: Displays the number of available hostel beds.
   - **Accommodate Beds**: Manages bed allocation for students.

6. **Academic Management**:
   - **Add Marks**: Enter academic marks for students based on their class and subjects.

## Functionality Details

### 1. Reports

- **Total Students**: Keeps a record of the total number of students enrolled in the institution.
- **Absent Students**: Monitors and records the number of students absent on a given day.
- **Total Money Collected**: Tracks the total fees collected from students.
- **Students Yet to Pay Fees**: Identifies and lists students who have not yet paid their fees.
- **Total Beds Remaining**: Displays the current availability of beds in the hostel.

### 2. Student Management

![ERP Logo](C:\Users\Lenovo\Downloads\studentinfo.png)

#### Upload Student Details

Upload student details in bulk via a CSV file. The file should contain fields like Full Name, Gender, Date of Birth, Roll No, Standard, Adhaar Card No, Scholarship Applied, Address, Parent Information, Fees Information, etc.

#### Create Student Profile

Allows the creation of individual student profiles by entering details such as:

- **Full Name**
- **Gender**
- **Date of Birth**
- **Roll No**
- **Standard**
- **Adhaar Card No**
- **Scholarship Applied**
- **Address**
- **Parent Information**:
  - **Father Name**
  - **Father Occupation**
  - **Mother Name**
  - **Mother Occupation**
  - **Father Contact**
  - **Mother Contact**
  - **Address**
- **Fees Information**:
  - **Installment Type**
  - **Amount**
  - **Amount Date**
  - **Admission Date**

### 3. Attendance System

![ERP Logo](C:\Users\Lenovo\Downloads\attendance.png)

#### Global Attendance

Select the standard, date, and subject to mark attendance for all students in a class. Additionally, the system tracks absent students for further follow-up.

### 4. Fee Management

#### Show Fee Details

Displays detailed information on the fees paid by each student, including installment types and payment dates.

#### Pending Fees

Lists students who have outstanding fees, helping administrators follow up on pending payments.

### 5. Hostel Management

![ERP Logo](C:\Users\Lenovo\Downloads\hostel_accomodation.png)

#### Available Beds

Shows the current availability of beds in the hostel, assisting in the management of student accommodation.

#### Accommodate Beds

Facilitates the allocation of available beds to students requiring hostel accommodation.

### 6. Academic Management

#### Add Marks

Allows teachers to enter academic marks for students based on their class and subjects. This feature supports the evaluation and tracking of student performance.

## Usage

To use this system, follow these steps:

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/yourusername/student-erp.git
   cd student-erp
   ```
