package com.sesc.unistudycircle.student_service.services;

import com.sesc.unistudycircle.student_service.entities.Student;
import com.sesc.unistudycircle.student_service.exceptions.StudentNotFoundException;
import com.sesc.unistudycircle.student_service.repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {
    private final StudentRepository repository;

    @Override
    public Student createStudent(Student student) {
        //Add additional validation logic if required
        return repository.save(student);
    }

    @Override
    public Student getStudentById(long studentId) {
        return repository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with ID: " + studentId));
    }

    @Override
    public void deleteStudentById(long studentId) {
        if (!repository.existsById(studentId)) {
            throw new StudentNotFoundException("Student not found with ID: " + studentId);
        }
        repository.deleteById(studentId);
    }

    @Override
    public Student updateStudentById(long studentId, Student updatedStudent) {
        if (!repository.existsById(studentId)) {
            throw new StudentNotFoundException("Student not found with ID: " + studentId);
        }
        //Add additional validation logic if required
        updatedStudent.setStudentId(studentId);
        return repository.save(updatedStudent);
    }
}
