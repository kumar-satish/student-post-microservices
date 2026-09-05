package com.sesc.unistudycircle.student_service.controllers;

import com.sesc.unistudycircle.student_service.entities.Student;
import com.sesc.unistudycircle.student_service.services.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping()
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @PostMapping("/create")
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        Student createdStudent = studentService.createStudent(student);
        return new ResponseEntity<>(createdStudent, HttpStatus.CREATED);
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<Student> getStudentById(@PathVariable long studentId) {
        Student student = studentService.getStudentById(studentId);
        return new ResponseEntity<>(student, HttpStatus.OK);
    }

    @PutMapping("/{studentId}")
    public ResponseEntity<Student> updateStudentById(
            @PathVariable long studentId,
            @RequestBody Student updatedStudent) {
        Student student = studentService.updateStudentById(studentId, updatedStudent);
        return new ResponseEntity<>(student, HttpStatus.OK);
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<Void> deleteStudentById(@PathVariable long studentId) {
        studentService.deleteStudentById(studentId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
