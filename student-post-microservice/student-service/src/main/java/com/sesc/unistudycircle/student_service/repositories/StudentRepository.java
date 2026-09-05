package com.sesc.unistudycircle.student_service.repositories;

import com.sesc.unistudycircle.student_service.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
}
