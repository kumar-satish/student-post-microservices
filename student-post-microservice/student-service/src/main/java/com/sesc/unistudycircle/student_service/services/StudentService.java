package com.sesc.unistudycircle.student_service.services;

import com.sesc.unistudycircle.student_service.entities.Student;

public interface StudentService {

    Student createStudent(Student student);

    Student getStudentById(long studentId);

    void deleteStudentById(long studentId);

    Student updateStudentById(long studentId, Student updatedStudent);
}

