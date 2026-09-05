package com.sesc.unistudycircle.student_service.exceptions;

public class StudentNotFoundException extends RuntimeException {
    public StudentNotFoundException(String message) {
        super(message);
    }

    public StudentNotFoundException(String message, Throwable th) {

        super(message, th);
    }
}
